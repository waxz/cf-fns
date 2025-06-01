// use html_editor::operation::*;
// use html_editor::{Node, parse};

// use std::io::{self, Write};

// use html5ever::driver::ParseOpts;
// use html5ever::local_name;
// use html5ever::ns;
// use html5ever::tendril::TendrilSink;
// use html5ever::tree_builder::TreeBuilderOpts;
// use html5ever::{parse_document, serialize};

// // use html5ever::sink::rcdom::RcDom;
// // use html5ever::{parse, one_input};

// use markup5ever_rcdom::{Handle, NodeData, RcDom, SerializableHandle};
// // This is not proper HTML serialization, of course.

// fn walk(
//     indent: usize,
//     handle: &Handle,
//     parent: Option<&Handle>,
//     proxy_host: &str,
//     target_host: &str,
// ) {
//     let node = handle;

//     match node.data {
//         NodeData::Document => {}

//         NodeData::Doctype {
//             ref name,
//             ref public_id,
//             ref system_id,
//         } => {}

//         NodeData::Text { ref contents } => {
//            //("#text: {}", contents.borrow().escape_default())
//         }

//         NodeData::Comment { ref contents } => {

//         }

//         NodeData::Element {
//             ref name,
//             ref attrs,
//             ..
//         } => {
//             match name.local {
//                 local_name!("img") => {
//                     let mut attrs_mut = attrs.borrow_mut();
//                     for attr in attrs_mut.iter_mut() {
//                         if attr.name.local.as_ref() == "src" || attr.name.local.as_ref() == "srcset"
//                         {
//                             let is_root = attr.value.starts_with("/");
//                             let is_http = attr.value.starts_with("http");

//                             if is_root {
//                                 // attr.value = format!("{}/{}/{}", proxy_host,target_host, attr.value).into();
//                             }

//                             if is_http {
//                                 // attr.value = format!("{}/{}", proxy_host, attr.value).into();

//                             }
//                         }
//                     }
//                 }
//                 _ => {}
//             }
//         }

//         NodeData::ProcessingInstruction { .. } => unreachable!(),
//     }

//     for child in node.children.borrow().iter() {
//         walk(indent + 4, child, Some(&node), proxy_host, target_host);
//     }
// }
// https://niklak.github.io/dom_query_by_example/accessing-and-manipulating-the-element's-attributes.html
use dom_query::{Document, NodeRef};

fn replace_link(e: &NodeRef, proxy_host: &str, target_host: &str, attrs: &[&str]) {
    for attr in attrs.iter() {
        let value = e.attr_or(attr, "");
        if value.starts_with("/") {
            e.set_attr(
                attr,
                format!("{proxy_host}/{target_host}{value}").as_str(),
            );
        }
        if value.starts_with("http") {
            e.set_attr(attr, format!("{proxy_host}/{value}").as_str());
        }
    }
}

use regex;


pub fn my_html_rewrite(text: &str, proxy_host: &str, target_host: &str, inject:&str) -> String {
    let doc = Document::from(text);
 

    // Select the div with class "content"

    let mut head = doc.select("head");
    head.prepend_html(inject);

    // Selecting multiple elements
    doc.select("img").nodes().iter().for_each(|e| {
        let attrs = ["src"];
        replace_link(e, proxy_host, target_host, &attrs);

        if e.has_attr("srcset") {
            // srcset="https://ichef.bbci.co.uk/news/240/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 240w,https://ichef.bbci.co.uk/news/320/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 320w,https://ichef.bbci.co.uk/news/480/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 480w,https://ichef.bbci.co.uk/news/640/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 640w,https://ichef.bbci.co.uk/news/800/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 800w,https://ichef.bbci.co.uk/news/1024/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 1024w,https://ichef.bbci.co.uk/news/1536/cpsprodpb/327c/live/c1597290-338f-11f0-b9e6-8fbaa4ab84e9.jpg.webp 1536w"
            // fix error srcset="https://abc.com/proxy/https://www.bbc.com1536w"
            let value = e.attr_or("srcset", "");
            let mut new_value = value.clone();
            
            let re = regex::Regex::new(r"([^\s,]*\.+[^\s,]*)").unwrap();
            let caps = re.captures_iter(&value);
            for cap in caps.into_iter() {
                let url =  cap.get(0).unwrap().as_str();

                if url.starts_with("/"){
                    let new_url = format!("{proxy_host}/{target_host}/{url}");
                    new_value = new_value.replace(url, new_url.as_str()).into();
                }
                if url.starts_with("http") {
                    let new_url = format!("{proxy_host}/{url}");
                    new_value = new_value.replace(url, new_url.as_str()).into();
                }
                
            }
            e.set_attr("srcset", new_value.to_string().as_str());

        }
 
       

    });
    doc.select("a").nodes().iter().for_each(|e| {
        let attrs = ["ref", "href"];
        replace_link(e, proxy_host, target_host, &attrs);
    });

    doc.select("link").nodes().iter().for_each(|e| {
        let attrs = ["ref", "href"];
        replace_link(e, proxy_host, target_host, &attrs);
    });
    doc.select("form").nodes().iter().for_each(|e| {
        let attrs = ["action"];
        replace_link(e, proxy_host, target_host, &attrs);
    });

    doc.select("style").nodes().iter().for_each(|e| {
        let mut text = e.text();
        let mut new_text = e.text().clone();
 

        // src:url(https://static.files.bbci.co.uk/fonts/reith/2.512/BBCReithSans_W_LtIt.woff2)
        let re = regex::Regex::new(r"src:url\((.*)\)").unwrap();
        let caps = re.captures_iter(&text);
        for cap in caps.into_iter() {

            let url = cap.get(1).unwrap().as_str();



            if url.starts_with("/") {
                let new_url = format!("{proxy_host}/{target_host}{url}");
                new_text = new_text.replace(url, new_url.as_str()).into();
            }
            if url.starts_with("http") {
                let new_url = format!("{proxy_host}/{url}");
                new_text = new_text.replace(url, new_url.as_str()).into();
            }
        }
        e.set_text(new_text);
    });

    doc.select("script").nodes().iter().for_each(|e| {
        let attrs = ["src"];
        replace_link(e, proxy_host, target_host, &attrs);
        let  text = e.text();


    


    });
    let resp_html = doc.html().to_string();

    return resp_html;
}

pub fn my_script_rewrite(html: &str, proxy_host: &str, target_host: &str) -> String {
    let doc = Document::from(html);
    // Selecting multiple elements
    doc.select("img")
        .nodes()
        .iter()
        .for_each(|e| e.set_attr("name", "val"));
    let resp_html = doc.html().to_string();

    return resp_html;
}
