//! セッション終了時のエクセルへの書き戻し (spec 6).

use crate::excel::ExcelHandler;
use crate::model::SessionResult;
use crate::{question_sheet, setting_sheet};

/// セッションの結果をエクセルへ書き戻す.
/// ブックを 1 回開き、設定シート・問題シートの対象セルだけ書き換えて 1 回保存する.
/// ファイルがエクセルで開かれている等で保存できない場合は Err を返す (呼び出し側で再試行させる).
pub fn save_session(result: &SessionResult) -> Result<(), String> {
    // ライブラリ内部でパニックが起きてもアプリを落とさず、エラーとして返す (読み込みと同じ)
    std::panic::catch_unwind(|| save_session_unchecked(result)).unwrap_or_else(|_| {
        Err(format!(
            "エクセルの書き込み中に予期しないエラーが発生しました: {}",
            result.item.file_path
        ))
    })
}

fn save_session_unchecked(result: &SessionResult) -> Result<(), String> {
    let mut excel = ExcelHandler::open(&result.item.file_path)?;
    // &mut excel: 書き換えるための借用 (可変参照) を渡す. 所有権は手元に残るので後で save できる
    setting_sheet::write_item(&mut excel, &result.item)?;
    question_sheet::write_progresses(&mut excel, &result.progresses)?;
    excel.save()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::QuestionProgress;
    use std::path::PathBuf;

    fn temp_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!(
            "my_english_session_test_{}_{}.xlsx",
            name,
            std::process::id()
        ))
    }

    /// 設定シート・問題シート・他のシート (数式・書式あり) を持つブックを作る
    fn create_book(path: &PathBuf) {
        let mut book = umya_spreadsheet::new_file();
        // 既定の Sheet1 を「他のシート」として使う
        {
            let other = book.sheet_by_name_mut("Sheet1").unwrap();
            other.cell_mut("A1").set_value("10");
            other.cell_mut("A2").set_formula("A1*2");
            other.cell_mut("A1").style_mut().font_mut().set_bold(true);
        }
        book.new_sheet("出力情報").unwrap();
        {
            let setting = book.sheet_by_name_mut("出力情報").unwrap();
            let values = ["1", "表示名", "0", "4", "3", "./audio"];
            for (i, value) in values.iter().enumerate() {
                setting.cell_mut((3, i as u32 + 1)).set_value(*value);
            }
            setting.cell_mut("B3").set_value("周回数"); // ラベル (書き換えないはず)
        }
        book.new_sheet("Phrases").unwrap();
        {
            let phrases = book.sheet_by_name_mut("Phrases").unwrap();
            phrases.cell_mut("A1").set_value("No");
            for (i, no) in ["1", "2"].iter().enumerate() {
                let row = i as u32 + 2;
                phrases.cell_mut((1, row)).set_value(*no);
                phrases.cell_mut((6, row)).set_value(format!("english {}", no));
            }
        }
        umya_spreadsheet::writer::xlsx::write(&book, path).unwrap();
    }

    #[test]
    fn 設定と問題を書き戻し_他のシートは壊さない() {
        let path = temp_path("save");
        create_book(&path);
        let mut item = setting_sheet::read_item(path.to_str().unwrap()).unwrap();
        item.play_count = 1;
        item.resume_no = Some(2);
        let result = SessionResult {
            item,
            progresses: vec![QuestionProgress { no: 1, asked_count: Some(1), is_hidden: Some(true) }],
        };

        save_session(&result).unwrap();

        let book = umya_spreadsheet::reader::xlsx::read(&path).unwrap();
        let setting = book.sheet_by_name("出力情報").unwrap();
        assert_eq!(setting.value("C3"), "1");
        assert_eq!(setting.value("C7"), "2");
        assert_eq!(setting.value("B3"), "周回数");
        let phrases = book.sheet_by_name("Phrases").unwrap();
        assert_eq!(phrases.value("E2"), "1");
        assert_eq!(phrases.value("I2").to_uppercase(), "TRUE");
        assert_eq!(phrases.value("E3"), "");
        let other = book.sheet_by_name("Sheet1").unwrap();
        assert_eq!(other.cell("A2").unwrap().formula(), "A1*2");
        assert!(other.style("A1").font().unwrap().bold());
        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn ファイルが無ければエラーになる() {
        let path = temp_path("missing");
        std::fs::remove_file(&path).ok();
        let mut item = {
            create_book(&path);
            setting_sheet::read_item(path.to_str().unwrap()).unwrap()
        };
        std::fs::remove_file(&path).ok();
        item.play_count = 1;
        let result = SessionResult { item, progresses: vec![] };
        assert!(save_session(&result).is_err());
    }
}
