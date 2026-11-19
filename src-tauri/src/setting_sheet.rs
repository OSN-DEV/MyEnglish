use crate::excel::{ExcelHandler, Sheet};
use crate::model::{Item, QuestionOrder};

/// 設定シートのシート名
const SHEET_NAME: &str = "出力情報";
/// 値が入っている列 (C 列)
const VALUE_COL: u32 = 3;

// 各項目の行番号
const ID_ROW: u32 = 1;
const DISPLAY_NAME_ROW: u32 = 2;
const PLAY_COUNT_ROW: u32 = 3;
const HIDDEN_THRESHOLD_ROW: u32 = 4;
const PREV_HIDDEN_THRESHOLD_ROW: u32 = 5;
const AUDIO_DIR_ROW: u32 = 6;
const RESUME_NO_ROW: u32 = 7;
const RESUME_ORDER_ROW: u32 = 8;
const QUESTION_COUNT_ROW: u32 = 9;
const QUESTION_ORDER_ROW: u32 = 10;
const AUTO_PLAY_ROW: u32 = 11;
const REPEAT_COUNT_ROW: u32 = 12;
const AUTO_MOVE_ROW: u32 = 13;
const PLAYBACK_SPEED_ROW: u32 = 14;

// 出題・再生設定が空のときの既定値
const DEFAULT_QUESTION_COUNT: u32 = 10;
const DEFAULT_AUTO_PLAY: bool = true;
const DEFAULT_REPEAT_COUNT: u32 = 1;
const DEFAULT_AUTO_MOVE: bool = false;
const DEFAULT_PLAYBACK_SPEED: f64 = 1.0;

/// エクセルの設定シートを読み込む.
/// ライブラリ内部でパニックが起きてもアプリを落とさず、エラーとして返す
pub fn read_item(file_path: &str) -> Result<Item, String> {
    std::panic::catch_unwind(|| read_item_unchecked(file_path)).unwrap_or_else(|_| {
        Err(format!(
            "エクセルの読み込み中に予期しないエラーが発生しました: {}",
            file_path
        ))
    })
}

fn read_item_unchecked(file_path: &str) -> Result<Item, String> {
    // unwrap はエラー時にパニックしてアプリが落ちるため、? でエラーを返す
    let excel = ExcelHandler::open(file_path)?;
    let sheet = excel.sheet(SHEET_NAME)?;
    let reader = SettingReader { sheet: &sheet };

    Ok(Item {
        file_path: file_path.to_string(),
        id: reader.required_text(ID_ROW, "id")?,
        display_name: reader.required_text(DISPLAY_NAME_ROW, "displayName")?,
        play_count: reader.parse(PLAY_COUNT_ROW, "playCount")?,
        hidden_threshold: reader.parse(HIDDEN_THRESHOLD_ROW, "hiddenThreshold")?,
        prev_hidden_threshold: reader.parse(PREV_HIDDEN_THRESHOLD_ROW, "prevHiddenThreshold")?,
        audio_dir: reader.required_text(AUDIO_DIR_ROW, "audioDir")?,
        resume_no: reader.optional(RESUME_NO_ROW, "resumeNo")?,
        resume_order: reader.order_or_head(RESUME_ORDER_ROW, "resumeOrder")?,
        question_count: reader.parse_or(
            QUESTION_COUNT_ROW,
            "questionCount",
            DEFAULT_QUESTION_COUNT,
        )?,
        question_order: reader.order_or_head(QUESTION_ORDER_ROW, "questionOrder")?,
        auto_play: reader.bool_or(AUTO_PLAY_ROW, "autoPlay", DEFAULT_AUTO_PLAY)?,
        repeat_count: reader.parse_or(REPEAT_COUNT_ROW, "repeatCount", DEFAULT_REPEAT_COUNT)?,
        auto_move: reader.bool_or(AUTO_MOVE_ROW, "autoMove", DEFAULT_AUTO_MOVE)?,
        playback_speed: reader.parse_or(
            PLAYBACK_SPEED_ROW,
            "playbackSpeed",
            DEFAULT_PLAYBACK_SPEED,
        )?,
    })
}

/// 設定シートの書き戻し対象 (C 列 3・7〜14 行目) をブックに書き込む (保存は呼び出し側で行う).
/// 1〜2・4〜6 行目と C 列以外のセルには触れない.
pub fn write_item(excel: &mut ExcelHandler, item: &Item) -> Result<(), String> {
    let mut sheet = excel.sheet_mut(SHEET_NAME)?;
    // set_value は文字列から型を推定して保存する ("3" → 数値、"TRUE" → 真偽値、"" → 空)
    let values = [
        (PLAY_COUNT_ROW, item.play_count.to_string()),
        (
            RESUME_NO_ROW,
            // map: Some のときだけ中身を変換する. unwrap_or_default: None なら空文字
            item.resume_no.map(|no| no.to_string()).unwrap_or_default(),
        ),
        (RESUME_ORDER_ROW, order_value(item.resume_order).to_string()),
        (QUESTION_COUNT_ROW, item.question_count.to_string()),
        (QUESTION_ORDER_ROW, order_value(item.question_order).to_string()),
        (AUTO_PLAY_ROW, bool_value(item.auto_play).to_string()),
        (REPEAT_COUNT_ROW, item.repeat_count.to_string()),
        (AUTO_MOVE_ROW, bool_value(item.auto_move).to_string()),
        (PLAYBACK_SPEED_ROW, item.playback_speed.to_string()),
    ];
    for (row, value) in values {
        sheet.set_cell_rc(row, VALUE_COL, &value);
    }
    Ok(())
}

/// 出題順をエクセルの値 (0 = 先頭から / 1 = 出題回数が少ない順) にする
fn order_value(order: QuestionOrder) -> &'static str {
    match order {
        QuestionOrder::Head => "0",
        QuestionOrder::Fewer => "1",
    }
}

/// 真偽値をエクセルの値にする
fn bool_value(value: bool) -> &'static str {
    if value { "TRUE" } else { "FALSE" }
}

/// 設定シートの値を、項目の型に合わせて読み込む.
//<'a> ライフタイムパラメータ。
// SettingReaderが生きている間はSheetのインスタンスはメモリから削除されないことをコンパイラに約束している？
struct SettingReader<'a> {
    sheet: &'a Sheet<'a>,
}

impl SettingReader<'_> {
    fn text(&self, row: u32) -> String {
        self.sheet.get_cell_rc(row, VALUE_COL).trim().to_string()
    }

    /// 文字列を読み込む. 空の場合はエラー.
    fn required_text(&self, row: u32, field_name: &str) -> Result<String, String> {
        let value = self.text(row);
        if value.is_empty() {
            return Err(format!(
                "シート '{}' の {} 行目 ({}) が空です",
                SHEET_NAME, row, field_name
            ));
        }
        Ok(value)
    }

    /// 数値などを読み込む. 空の場合も変換エラー.
    fn parse<T: std::str::FromStr>(&self, row: u32, field_name: &str) -> Result<T, String> {
        self.sheet.parse_cell(row, VALUE_COL, field_name)
    }

    /// 数値などを読み込む. 空の場合は None.
    fn optional<T: std::str::FromStr>(
        &self,
        row: u32,
        field_name: &str,
    ) -> Result<Option<T>, String> {
        if self.text(row).is_empty() {
            return Ok(None);
        }
        self.parse(row, field_name).map(Some)
    }

    /// 数値などを読み込む. 空の場合は既定値.
    fn parse_or<T: std::str::FromStr>(
        &self,
        row: u32,
        field_name: &str,
        default: T,
    ) -> Result<T, String> {
        Ok(self.optional(row, field_name)?.unwrap_or(default))
    }

    /// 真偽値を読み込む. 空の場合は既定値.
    /// エクセルの真偽値セルは "TRUE" / "FALSE" で返るため、大文字小文字を区別しない
    fn bool_or(&self, row: u32, field_name: &str, default: bool) -> Result<bool, String> {
        let value = self.text(row);
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

    /// 出題順 (0 = 先頭から / 1 = 出題回数が少ない順) を読み込む. 空の場合は先頭から.
    fn order_or_head(&self, row: u32, field_name: &str) -> Result<QuestionOrder, String> {
        match self.text(row).as_str() {
            "" | "0" => Ok(QuestionOrder::Head),
            "1" => Ok(QuestionOrder::Fewer),
            value => Err(self.sheet.convert_error(row, field_name, value)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    /// テスト用の一時ファイルのパスを返す.
    fn temp_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "my_english_setting_test_{}_{}.xlsx",
            name,
            std::process::id()
        ))
    }

    /// 設定シートに C1 から順に値を書いたエクセルを作り、そのパスを返す.
    fn create_book(name: &str, values: &[&str]) -> PathBuf {
        let path = temp_path(name);
        let mut excel = ExcelHandler::create_new(&path);
        excel.add_sheet(SHEET_NAME).unwrap();
        {
            let mut sheet = excel.sheet_mut(SHEET_NAME).unwrap();
            for (i, value) in values.iter().enumerate() {
                sheet.set_cell_rc(i as u32 + 1, VALUE_COL, value);
            }
        }
        excel.save().unwrap();
        path
    }

    #[test]
    fn 全項目を読み込める() {
        let path = create_book(
            "all",
            &[
                "20260809",
                "表示名",
                "3",
                "4",
                "3",
                "./audio",
                "15",
                "1",
                "20",
                "1",
                "FALSE",
                "2",
                "TRUE",
                "1.2",
            ],
        );
        let item = read_item(path.to_str().unwrap()).unwrap();
        assert_eq!(item.id, "20260809");
        assert_eq!(item.play_count, 3);
        assert_eq!(item.resume_no, Some(15));
        assert_eq!(item.resume_order, QuestionOrder::Fewer);
        assert_eq!(item.question_count, 20);
        assert!(!item.auto_play);
        assert!(item.auto_move);
        assert_eq!(item.playback_speed, 1.2);
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn 出題と再生の設定が空なら既定値になる() {
        let path = create_book("defaults", &["1", "表示名", "0", "4", "3", "./audio"]);
        let item = read_item(path.to_str().unwrap()).unwrap();
        assert_eq!(item.resume_no, None);
        assert_eq!(item.resume_order, QuestionOrder::Head);
        assert_eq!(item.question_count, DEFAULT_QUESTION_COUNT);
        assert_eq!(item.question_order, QuestionOrder::Head);
        assert_eq!(item.auto_play, DEFAULT_AUTO_PLAY);
        assert_eq!(item.repeat_count, DEFAULT_REPEAT_COUNT);
        assert_eq!(item.auto_move, DEFAULT_AUTO_MOVE);
        assert_eq!(item.playback_speed, DEFAULT_PLAYBACK_SPEED);
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn 必須項目が空ならエラーになる() {
        let path = create_book("required", &["1", "", "0", "4", "3", "./audio"]);
        let error = read_item(path.to_str().unwrap()).unwrap_err();
        assert!(error.contains("displayName"));
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn 書き戻し対象の行だけを書き込み_読み直せる() {
        let path = create_book(
            "write",
            &["1", "表示名", "0", "4", "3", "./audio", "", "", "", "", "", "", "", ""],
        );
        let mut item = read_item(path.to_str().unwrap()).unwrap();
        item.play_count = 2;
        item.hidden_threshold = 99; // 書き戻し対象外なので保存されないはず
        item.resume_no = Some(12);
        item.resume_order = QuestionOrder::Fewer;
        item.question_count = 0;
        item.question_order = QuestionOrder::Fewer;
        item.auto_play = false;
        item.repeat_count = 3;
        item.auto_move = true;
        item.playback_speed = 1.3;

        let mut excel = ExcelHandler::open(&path).unwrap();
        excel.sheet_mut(SHEET_NAME).unwrap().set_cell("D3", "メモ");
        write_item(&mut excel, &item).unwrap();
        excel.save().unwrap();

        let reread = read_item(path.to_str().unwrap()).unwrap();
        assert_eq!(reread.play_count, 2);
        assert_eq!(reread.hidden_threshold, 4);
        assert_eq!(reread.resume_no, Some(12));
        assert_eq!(reread.resume_order, QuestionOrder::Fewer);
        assert_eq!(reread.question_count, 0);
        assert_eq!(reread.question_order, QuestionOrder::Fewer);
        assert!(!reread.auto_play);
        assert_eq!(reread.repeat_count, 3);
        assert!(reread.auto_move);
        assert_eq!(reread.playback_speed, 1.3);
        let excel = ExcelHandler::open(&path).unwrap();
        assert_eq!(excel.sheet(SHEET_NAME).unwrap().get_cell("D3"), "メモ");
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn resume_no_が_none_なら空にする() {
        let path = create_book("write_none", &["1", "表示名", "0", "4", "3", "./audio", "5"]);
        let mut item = read_item(path.to_str().unwrap()).unwrap();
        item.resume_no = None;
        let mut excel = ExcelHandler::open(&path).unwrap();
        write_item(&mut excel, &item).unwrap();
        excel.save().unwrap();
        assert_eq!(read_item(path.to_str().unwrap()).unwrap().resume_no, None);
        std::fs::remove_file(&path).ok();
    }
}
