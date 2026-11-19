//! 音声ファイルの存在確認.

use std::path::Path;

/// 候補のパスのうち、最初に存在するファイルのパスを返す. どれも無ければ None.
///
/// `&[String]` はスライスの借用 (呼び出し元の Vec を所有権ごと受け取らずに読むだけ).
/// `Option<String>` は「値があるかもしれない」型で、`Some(値)` か `None` のどちらか.
pub fn find_existing_file(candidates: &[String]) -> Option<String> {
    candidates
        .iter()
        // is_file: 存在し、かつフォルダではなくファイルのとき true
        .find(|path| Path::new(path).is_file())
        // find は &String (借用) を返すので、cloned で中身をコピーして String にする
        .cloned()
}

// #[cfg(test)]: `cargo test` のときだけコンパイルするモジュール
#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    /// テストごとに専用の一時フォルダを作る
    fn temp_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("my-english-audio-test-{}", name));
        let _ = fs::remove_dir_all(&dir); // 前回の残りを消す (無ければエラーになるが無視)
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn path_string(path: &Path) -> String {
        path.to_string_lossy().into_owned()
    }

    #[test]
    fn returns_first_existing_candidate() {
        let dir = temp_dir("first");
        fs::write(dir.join("071.mp3"), b"").unwrap();
        let candidates = vec![
            path_string(&dir.join("0071.mp3")),
            path_string(&dir.join("071.mp3")),
        ];
        assert_eq!(find_existing_file(&candidates), Some(candidates[1].clone()));
    }

    #[test]
    fn prefers_earlier_candidate_when_both_exist() {
        let dir = temp_dir("both");
        fs::write(dir.join("0071.mp3"), b"").unwrap();
        fs::write(dir.join("071.mp3"), b"").unwrap();
        let candidates = vec![
            path_string(&dir.join("0071.mp3")),
            path_string(&dir.join("071.mp3")),
        ];
        assert_eq!(find_existing_file(&candidates), Some(candidates[0].clone()));
    }

    #[test]
    fn returns_none_when_nothing_exists() {
        let dir = temp_dir("none");
        let candidates = vec![path_string(&dir.join("0071.mp3"))];
        assert_eq!(find_existing_file(&candidates), None);
    }

    #[test]
    fn ignores_directories() {
        let dir = temp_dir("dir");
        fs::create_dir_all(dir.join("0071.mp3")).unwrap();
        let candidates = vec![path_string(&dir.join("0071.mp3"))];
        assert_eq!(find_existing_file(&candidates), None);
    }
}
