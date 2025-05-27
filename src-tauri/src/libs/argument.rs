use serde::Deserialize;
use specta::Type;

#[derive(Deserialize, Type)]
pub struct MyCustomArgumentType {
    pub foo: String,
    pub bar: i32,
}
