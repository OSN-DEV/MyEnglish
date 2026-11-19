use crate::excel::{ExcelHandler, Sheet};
use crate::model::{Item, Question, QuestionOrder, QuestionProgress};
use std::collections::HashMap;

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

/// 全問題を、出題順に並べて取得する (出題対象外も含む。出題数では切り詰めない).
/// 出題対象外も返すのは、再開位置の問題が対象外になったときに「並び順でその次」を求めるため
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

println!("file {}", item.file_path);    
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
        // 出題対象かどうか (閾値・非表示) の判定はフロントで行うため、ここでは除外しない
        let asked_count = reader.parse_or(row, ASKED_COUNT_COL, "askedCount", 0)?;
        let is_hidden = reader.bool_or(row, IS_HIDDEN_COL, "isHidden", false)?;
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

    // 出題対象の抽出と出題数での切り詰めは、フロントで行う (features/question/logic/session.ts)
    Ok(questions)
}

/// 問題ごとの出題回数 (E 列)・非表示 (I 列) をブックに書き込む (保存は呼び出し側で行う).
/// 他の列・行には触れない. 書き込む行は A 列の No で探す.
pub fn write_progresses(
    excel: &mut ExcelHandler,
    progresses: &[QuestionProgress],
) -> Result<(), String> {
    let mut sheet = excel.sheet_mut(SHEET_NAME)?;

    // No → 行番号 の対応を作る (読み込みと同じく、英文が空の行で終わり)
    // HashMap はキーから値を引ける辞書. new() で空のものを作り、insert で追加する
    let mut rows_by_no: HashMap<u32, u32> = HashMap::new();
    {
        // このブロックの中だけ読み込み用として借りる. ブロックを抜けると借用が終わり、下で書き込める
        let reader_sheet = sheet.as_sheet();
        let reader = QuestionReader { sheet: &reader_sheet };
        let mut row = START_ROW;
        while !reader.text(row, ENGLISH_COL).is_empty() {
            let no: u32 = reader.parse(row, NO_COL, "no")?;
            rows_by_no.insert(no, row);
            row += 1;
        }
    }

    for progress in progresses {
        // get は Option<&u32> を返す. ok_or_else で None をエラーに変え、? で返す
        let row = *rows_by_no.get(&progress.no).ok_or_else(|| {
            format!(
                "シート '{}' に No {} の問題が見つかりません",
                SHEET_NAME, progress.no
            )
        })?;
        // if let Some(x) = ...: Some のときだけ中身を x に取り出して処理する
        if let Some(asked_count) = progress.asked_count {
            sheet.set_cell_rc(row, ASKED_COUNT_COL, &asked_count.to_string());
        }
        if let Some(is_hidden) = progress.is_hidden {
            sheet.set_cell_rc(row, IS_HIDDEN_COL, if is_hidden { "TRUE" } else { "FALSE" });
        }
    }
    Ok(())
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn temp_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "my_english_question_test_{}_{}.xlsx",
            name,
            std::process::id()
        ))
    }

    /// No・出題回数・英文・非表示だけを入れた問題シートを作る. rows: (No, 出題回数, 英文)
    fn create_book(name: &str, rows: &[(&str, &str, &str)]) -> ExcelHandler {
        let mut excel = ExcelHandler::create_new(temp_path(name));
        excel.add_sheet(SHEET_NAME).unwrap();
        let mut sheet = excel.sheet_mut(SHEET_NAME).unwrap();
        sheet.set_cell("A1", "No");
        // enumerate: (番号, 要素) の組で回す
        for (i, (no, asked, english)) in rows.iter().enumerate() {
            let row = START_ROW + i as u32;
            sheet.set_cell_rc(row, NO_COL, no);
            sheet.set_cell_rc(row, ASKED_COUNT_COL, asked);
            sheet.set_cell_rc(row, ENGLISH_COL, english);
            sheet.set_cell_rc(row, MEMO_COL, "memo");
        }
        excel
    }

    #[test]
    fn 変更した問題の出題回数と非表示だけを書き込む() {
        let mut excel = create_book("write", &[("1", "2", "a"), ("2", "", "b"), ("3", "0", "c")]);
        let progresses = vec![
            QuestionProgress { no: 2, asked_count: Some(1), is_hidden: None },
            QuestionProgress { no: 3, asked_count: None, is_hidden: Some(true) },
        ];
        write_progresses(&mut excel, &progresses).unwrap();

        let sheet = excel.sheet(SHEET_NAME).unwrap();
        assert_eq!(sheet.get_cell("E2"), "2"); // No 1 は変更なし
        assert_eq!(sheet.get_cell("E3"), "1");
        assert_eq!(sheet.get_cell("I3"), ""); // None は書かない
        assert_eq!(sheet.get_cell("E4"), "0");
        assert_eq!(sheet.get_cell("I4").to_uppercase(), "TRUE");
        assert_eq!(sheet.get_cell("H3"), "memo"); // 他の列は変わらない
    }

    #[test]
    fn 見つからない_no_はエラーになる() {
        let mut excel = create_book("missing_no", &[("1", "0", "a")]);
        let progresses = vec![QuestionProgress { no: 9, asked_count: Some(1), is_hidden: None }];
        let error = write_progresses(&mut excel, &progresses).unwrap_err();
        assert!(error.contains("No 9"));
    }
}
