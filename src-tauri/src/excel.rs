// https://github.com/mathnya/umya-spreadsheet

use std::path::{Path, PathBuf};
use umya_spreadsheet::{Workbook, Worksheet, reader, writer};

/// エクセルブックの読み書きを行う.
/// ブックは開いた時点で全体をメモリに読み込むため、ファイルを開いたままにはしない.
/// 書き込んだ内容は `save` を呼ぶまでファイルに反映されず、保存せずに破棄すると失われる.
pub struct ExcelHandler {
    book: Workbook,
    file_path: PathBuf,
}

impl ExcelHandler {
    /// ブックを開く.
    // AsRef<Path>はPathに変換できるもの、という制約らしい
    pub fn open<P: AsRef<Path>>(path: P) -> Result<Self, String> {
        let path_buf = path.as_ref().to_path_buf();
        let book = reader::xlsx::read(&path_buf)
            .map_err(|e| format!("Excelのオープンに失敗しました: {:?}", e))?;

        Ok(Self {
            book,
            file_path: path_buf,
        })
    }

    /// ブックを作成する.
    pub fn create_new<P: AsRef<Path>>(path: P) -> Self {
        let book = umya_spreadsheet::new_file();
        Self {
            book,
            file_path: path.as_ref().to_path_buf(),
        }
    }

    /// 読み込み用にシートを取得する.
    /// 返したシートを使っている間は、同じブックへの書き込みや保存はできない.
    pub fn sheet(&self, sheet_name: &str) -> Result<Sheet<'_>, String> {
        let sheet = self
            .book
            .sheet_by_name(sheet_name)
            .map_err(|e| format!("シート '{}' の取得に失敗しました: {:?}", sheet_name, e))?;
        Ok(Sheet { sheet })
    }

    /// 読み書き用にシートを取得する.
    /// 返したシートを使っている間は、他のシートの取得や保存はできない.
    pub fn sheet_mut(&mut self, sheet_name: &str) -> Result<SheetMut<'_>, String> {
        let sheet = self
            .book
            .sheet_by_name_mut(sheet_name)
            .map_err(|e| format!("シート '{}' の取得に失敗しました: {:?}", sheet_name, e))?;
        Ok(SheetMut { sheet })
    }

    /// ブックをファイルに保存する.
    /// 失敗してもインスタンスは残るため、同じ内容で再試行できる.
    pub fn save(&self) -> Result<(), String> {
        writer::xlsx::write(&self.book, &self.file_path)
            .map_err(|e| format!("Excelの保存に失敗しました: {:?}", e))?;
        Ok(())
    }
}

/// 読み込み用のシート (`ExcelHandler::sheet` で取得).
pub struct Sheet<'a> {
    sheet: &'a Worksheet,
}

impl Sheet<'_> {
    /// 指定したセルの値を取得する.
    /// @param cell_address セル番地 ("A1" など)
    pub fn get_cell(&self, cell_address: &str) -> String {
        self.sheet.value(cell_address)
    }

    /// 行・列を指定してセルの値を取得する.
    /// @param row 行番号 (1 始まり)
    /// @param col 列番号 (1 始まり、A 列 = 1)
    pub fn get_cell_rc(&self, row: u32, col: u32) -> String {
        // umya-spreadsheet の座標は (列, 行) の順
        self.sheet.value((col, row))
    }
}

/// 読み書き用のシート (`ExcelHandler::sheet_mut` で取得).
pub struct SheetMut<'a> {
    sheet: &'a mut Worksheet,
}

impl SheetMut<'_> {
    /// 指定したセルの値を取得する.
    /// @param cell_address セル番地 ("A1" など)
    pub fn get_cell(&self, cell_address: &str) -> String {
        self.sheet.value(cell_address)
    }

    /// 行・列を指定してセルの値を取得する.
    /// @param row 行番号 (1 始まり)
    /// @param col 列番号 (1 始まり、A 列 = 1)
    pub fn get_cell_rc(&self, row: u32, col: u32) -> String {
        // umya-spreadsheet の座標は (列, 行) の順
        self.sheet.value((col, row))
    }

    /// 指定したセルに値を設定する.
    /// @param cell_address セル番地 ("A1" など)
    /// @param value 設定する値
    pub fn set_cell(&mut self, cell_address: &str, value: &str) {
        self.sheet.cell_mut(cell_address).set_value(value);
    }

    /// 行・列を指定してセルに値を設定する.
    /// @param row 行番号 (1 始まり)
    /// @param col 列番号 (1 始まり、A 列 = 1)
    /// @param value 設定する値
    pub fn set_cell_rc(&mut self, row: u32, col: u32, value: &str) {
        // umya-spreadsheet の座標は (列, 行) の順
        self.sheet.cell_mut((col, row)).set_value(value);
    }
}

// 呼び出し元のサンプル
// fn main() -> Result<(), String> {
//     // 1. ファイルを開いてインスタンスを保持する
//     let mut excel = ExcelHandler::open("example.xlsx")?;
//
//     // 2. シートを 1 回取得すれば、何回でもセルの読み書きができる
//     {
//         let mut sheet = excel.sheet_mut("Sheet1")?;
//         println!("A1の元の値: {}", sheet.get_cell("A1"));
//         sheet.set_cell("A1", "新しい値だよ");
//         sheet.set_cell_rc(2, 2, "100"); // B2
//     } // sheet はここで破棄され、excel を再び使えるようになる
//
//     // 3. 処理が終わったら保存する。失敗した場合は excel.save() を再度呼べば再試行できる
//     excel.save()?;
//
//     println!("Excelファイルの更新と保存が完了しました！");
//     Ok(())
//     // excel はここでスコープを抜けて自動で破棄される (クローズ処理は不要)
// }

#[cfg(test)]
mod tests {
    use super::*;

    /// テスト用の一時ファイルのパスを返す.
    fn temp_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!("my_english_test_{}_{}.xlsx", name, std::process::id()))
    }

    #[test]
    fn 書き込んで保存した値を読み込める() {
        let path = temp_path("save_and_open");
        let mut excel = ExcelHandler::create_new(&path);
        {
            let mut sheet = excel.sheet_mut("Sheet1").unwrap();
            sheet.set_cell("A1", "hello");
            sheet.set_cell_rc(2, 3, "world"); // C2
        }
        excel.save().unwrap();

        let reopened = ExcelHandler::open(&path).unwrap();
        let sheet = reopened.sheet("Sheet1").unwrap();
        assert_eq!(sheet.get_cell("A1"), "hello");
        assert_eq!(sheet.get_cell_rc(1, 1), "hello");
        assert_eq!(sheet.get_cell("C2"), "world");
        assert_eq!(sheet.get_cell_rc(2, 3), "world");

        std::fs::remove_file(&path).ok();
    }

    #[test]
    fn 存在しないシートは取得できない() {
        let mut excel = ExcelHandler::create_new(temp_path("missing_sheet"));
        assert!(excel.sheet("NotExist").is_err());
        assert!(excel.sheet_mut("NotExist").is_err());
    }
}
