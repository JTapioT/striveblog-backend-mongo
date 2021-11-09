import PdfPrinter from "pdfmake";


function getPDFReadableStream(data) {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
  }

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [...data],
    defaultStyle: {
      font: "Helvetica"
    }
  }

  //const options = {}

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition);

  pdfReadableStream.end();
  return pdfReadableStream;
}

export default getPDFReadableStream;