use crate::excel::{ExcelHandler, Sheet};
use crate::model::{Item, Question, QuestionOrder};

/// 問題シートのシート名
const SHEET_NAME: &str = "Phrases";

const START_ROW: u32 = 2;

// 各項目の列番号
const NO_COL: u32 = 1;
const TITLE1_COL: u32 = 2;
const TITLE2_COL: u32 = 3;
const TITLE3_COL: u32 = 4;
const ASKED_COUNT_COL: u32 = 5;
const ENGLISH_COL: u32 = 6;
const JAPANESE_COL: u32 = 7;
const MEMO_COL: u32 = 8;
const IS_HIDDEN_COL: u32 = 9;

/// 出題対象の問題を、出題順に並べて取得する (出題数では切り詰めない)
pub fn read_questions(item: &Item) -> Result<Vec<Question>, String> {
    // TODO エラーメッセージにセルの情報を入れたい
    std::panic::catch_unwind(|| read_questions_unchecked(item)).unwrap_or_else(|_| {
        Err(format!(
            "エクセルの読み込み中に予期しないエラーが発生しました: {}",
            item.file_path
        ))
    })
}

pub fn read_questions_unchecked(item: &Item) -> Result<Vec<Question>, String> {
    // open は AsRef<Path> (パスとして参照できる型) を受け取るので、String をコピーせず借用で渡せる
    let excel = ExcelHandler::open(&item.file_path)?;
    let sheet = excel.sheet(SHEET_NAME)?;
    let reader = QuestionReader { sheet: &sheet };

    let mut row: u32 = START_ROW - 1;
    let mut v: String;
    let mut title1: String = String::from("");
    let mut title2: String = String::from("");
    let mut title3: String = String::from("");
    let mut questions = Vec::new();
    loop {
        row += 1;

        v = reader.text(row, ENGLISH_COL);
        if v.is_empty() {
            break;
        }

        v = reader.text(row, TITLE1_COL);
        if !v.is_empty() {
            title1 = v.clone();
            title2 = String::from("");
            title3 = String::from("");
        }

        v = reader.text(row, TITLE2_COL);
        if !v.is_empty() {
            title2 = v.clone();
            title3 = String::from("");
        }

        v = reader.text(row, TITLE3_COL);
        if !v.is_empty() {
            title3 = v.clone();
        }

        let no = reader.parse(row, NO_COL, "no")?;
        let asked_count = reader.parse_or(row, ASKED_COUNT_COL, "askedCount", 0)?;
        if item.hidden_threshold <= asked_count {
            continue;
        }
        let is_hidden = reader.bool_or(row, IS_HIDDEN_COL, "isHidden", false)?;
        if is_hidden {
            continue;
        }
        let english = reader.required_text(row, ENGLISH_COL, "english")?;
        let japanese = reader.text(row, JAPANESE_COL);
        let memo = reader.text(row, MEMO_COL);

        // フィールド名と変数名が同じなら `no: no` を `no` と省略できる (フィールド初期化の省略記法)
        questions.push(Question {
            no,
            title1: title1.clone(),
            title2: title2.clone(),
            title3: title3.clone(),
            asked_count,
            english,
            japanese,
            memo,
            is_hidden,
        })
    }

    // enum への match は全ての値を書かないとコンパイルエラーになるため、
    // 出題順が増えたときに並べ替えの書き漏れをコンパイラが教えてくれる
    match item.question_order {
        QuestionOrder::Head => questions.sort_by_key(|q| q.no),
        QuestionOrder::Fewer => questions.sort_by_key(|q| {
            // 条件に応じてグループ分けの優先度（0, 1, 2...）を決定する
            let group_priority = if q.asked_count <= item.prev_hidden_threshold {
                0 // 条件1: 閾値1以下のデータ（最優先）
            } else {
                1
            };

            // タプルを返すことで「グループ順 → グループ内での no の昇順」でソートされる
            (group_priority, q.no)
        }),
    }

    // 出題数での切り詰めは、再開位置・周回の判定に全件が必要なためフロントで行う
    Ok(questions)
}

/// 問題シートの値を、項目の型に合わせて読み込む.
// <'a> はライフタイムパラメータ。QuestionReader が借りている Sheet より長く
// QuestionReader が生き残らないことを、コンパイラがチェックする
struct QuestionReader<'a> {
    sheet: &'a Sheet<'a>,
}

impl QuestionReader<'_> {
    fn text(&self, row: u32, col: u32) -> String {
        self.sheet.get_cell_rc(row, col).trim().to_string()
    }

    /// 数値などを読み込む. 空の場合も変換エラー.
    fn parse<T: std::str::FromStr>(
        &self,
        row: u32,
        col: u32,
        field_name: &str,
    ) -> Result<T, String> {
        self.sheet.parse_cell(row, col, field_name)
    }

    /// 真偽値を読み込む. 空の場合は既定値.
    /// エクセルの真偽値セルは "TRUE" / "FALSE" で返るため、大文字小文字を区別しない
    fn bool_or(&self, row: u32, col: u32, field_name: &str, default: bool) -> Result<bool, String> {
        let value = self.text(row, col);
        if value.is_empty() {
            Ok(default)
        } else if value.eq_ignore_ascii_case("true") {
            Ok(true)
        } else if value.eq_ignore_ascii_case("false") {
            Ok(false)
        } else {
            Err(self.sheet.convert_error(row, field_name, &value))
        }
    }

    /// 数値などを読み込む. 空の場合は既定値.
    fn parse_or<T: std::str::FromStr>(
        &self,
        row: u32,
        col: u32,
        field_name: &str,
        default: T,
    ) -> Result<T, String> {
        Ok(self.optional(row, col, field_name)?.unwrap_or(default))
    }

    /// 数値などを読み込む. 空の場合は None.
    fn optional<T: std::str::FromStr>(
        &self,
        row: u32,
        col: u32,
        field_name: &str,
    ) -> Result<Option<T>, String> {
        if self.text(row, col).is_empty() {
            return Ok(None);
        }
        self.parse(row, col, field_name).map(Some)
    }

    /// 文字列を読み込む. 空の場合はエラー.
    fn required_text(&self, row: u32, col: u32, field_name: &str) -> Result<String, String> {
        let value = self.text(row, col);
        if value.is_empty() {
            return Err(format!(
                "シート '{}' の {} 行目 ({}) が空です",
                SHEET_NAME, row, field_name
            ));
        }
        Ok(value)
    }
}
