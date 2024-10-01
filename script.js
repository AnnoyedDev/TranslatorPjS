(function() {

    function convertColor(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length !== 6) {
            console.warn(`Invalid color format : ${hex}`);
            return '000000'; 
        }
        const rr = hex.slice(0, 2);
        const gg = hex.slice(2, 4);
        const bb = hex.slice(4, 6);
        return `${bb}${gg}${rr}`.toUpperCase();
    }

    function extractGradientColors(gradient) {
        const regex = /#([0-9A-Fa-f]{6})/g;
        let match;
        const colors = [];
        while ((match = regex.exec(gradient)) !== null) {
            colors.push(`#${match[1]}`);
        }
        return colors;
    }

    function processSpan(span) {
        const style = span.getAttribute('style') || '';
        let colors = [];
        let text = '';

        const colorMatch = style.match(/color:\s*(#[0-9A-Fa-f]{6})/);
        if (colorMatch) {
            colors.push(convertColor(colorMatch[1]));
        }

        const gradientMatch = style.match(/background:\s*linear-gradient\([^)]*\)/);
        if (gradientMatch) {
            const gradientColors = extractGradientColors(gradientMatch[0]);
            gradientColors.forEach(color => {
                colors.push(convertColor(color));
            });
        }

        text = span.innerHTML.replace(/<br\s*\/?>/gi, '\n');

        text = text.replace(/\s+/g, ' ').trim();

        if (colors.length > 0) {
            let colorTags = '';
            colors.forEach(color => {
                colorTags += `{\\c&H${color}}`;
            });
            return colorTags + text;
        } else {
            return text;
        }
    }

    function extractTextWithColors(xpath) {
        const evaluator = new XPathEvaluator();
        const result = evaluator.evaluate(xpath, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        const targetNode = result.singleNodeValue;

        if (!targetNode) {
            console.error("Élément non trouvé avec le XPath fourni.");
            return "";
        }

        let output = '';

        targetNode.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.nodeValue.replace(/\r?\n|\r/g, "\n").trim();
                if (text) {
                    output += text;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    output += '\n';
                } else if (node.tagName === 'SPAN') {
                    output += processSpan(node);
                }
            }
        });

        return output;
    }

    const xpath = "/html/body/div[4]/div[4]/div[3]/main/div[3]/div[2]/div[1]/div[3]/div/div[2]/div/div/p";
    const extractedText = extractTextWithColors(xpath);
    console.log(extractedText);
})();
