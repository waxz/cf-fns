import html from "../../public/dist/quartz/index.html"




class AttributeRewriter {
    attributeName: any;
    oldValue: any;
    newValue: any;

    constructor(attributeName, oldValue, newValue) {
        this.attributeName = attributeName;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    element(element) {
        const attribute = element.getAttribute(this.attributeName);
        if (attribute) {
            element.setAttribute(
                this.attributeName,
                attribute.replace(this.oldValue, this.newValue),
            );
        }
    }
}


export const onRequest: PagesFunction<Env> = async (context) => {






    const rewriter = new HTMLRewriter()
        // .on("script[src]", new AttributeRewriter("src", "./", "/quartz/"))
        // .on("link[href]", new AttributeRewriter("href", "./", "/quartz/"))
        ;

    const resp = new Response(html, {
        status: 200,
        headers: {
            "content-type": "text/html;charset=UTF-8",
        },
    });

    const new_resp = rewriter.transform(resp);



    return new_resp;

}