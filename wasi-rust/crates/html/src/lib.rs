

pub fn test_html(){
    let input = r#"<div><a href="/about">About</a></div>"#;
let mut dom = tl::parse(input, tl::ParserOptions::default())
  .expect("HTML string too long");
  
let anchor = dom.query_selector("a[href]")
  .expect("Failed to parse query selector")
  .next()
  .expect("Failed to find anchor tag");

let parser_mut = dom.parser_mut();

let anchor = anchor.get_mut(parser_mut)
  .expect("Failed to resolve node")
  .as_tag_mut()
  .expect("Failed to cast Node to HTMLTag");

let attributes = anchor.attributes_mut();

attributes.get_mut("href")
  .flatten()
  .expect("Attribute not found or malformed")
  .set("http://localhost/about");
}