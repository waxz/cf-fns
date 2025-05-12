use html_editor::operation::*;
use html_editor::{Node, parse};

use std::io::{self, Write};

use html5ever::driver::ParseOpts;
use html5ever::ns;
use html5ever::tendril::TendrilSink;
use html5ever::tree_builder::TreeBuilderOpts;
use html5ever::{parse_document, serialize};
use markup5ever_rcdom::{Handle, NodeData, RcDom, SerializableHandle};

// This is not proper HTML serialization, of course.

fn walk(indent: usize, handle: &Handle, parent: Option<&Handle>) {
    let node = handle;

    for _ in 0..indent {
        print!(" ");
    }
    match node.data {
        NodeData::Document => println!("#Document"),

        NodeData::Doctype {
            ref name,
            ref public_id,
            ref system_id,
        } => println!("<!DOCTYPE {name} \"{public_id}\" \"{system_id}\">"),

        NodeData::Text { ref contents } => {
            println!("#text: {}", contents.borrow().escape_default())
        }

        NodeData::Comment { ref contents } => println!("<!-- {} -->", contents.escape_default()),

        NodeData::Element {
            ref name,
            ref attrs,
            ..
        } => {
            assert!(name.ns == ns!(html));
            println!("=== find new element <{}", name.local);
            for attr in attrs.borrow().iter() {
                assert!(attr.name.ns == ns!());
                println!("- attr {}=\"{}\"", attr.name.local, attr.value);
            }
            let mut attrs_mut = attrs.borrow_mut();
            for attr in attrs_mut.iter_mut() {
                if attr.name.local.as_ref() == "href" {
                    println!("Found href: {} — will change it.", attr.value);
                    // Replace the href value
                    attr.value = "/new/path/to/favicon.ico".into();
                }
            }
            println!(">");
        }

        NodeData::ProcessingInstruction { .. } => unreachable!(),
    }

    for child in node.children.borrow().iter() {
        walk(indent + 4, child, Some(&node));
    }
}

pub fn test_html(html: &str) {
    let dom = parse_document(RcDom::default(), Default::default()).one(html);

    walk(0, &dom.document, None);

    if !dom.errors.borrow().is_empty() {
        println!("\nParse errors:");
        for err in dom.errors.borrow().iter() {
            println!("    {err}");
        }
    }
}
