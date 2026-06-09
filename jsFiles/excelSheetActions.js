const ExcelJS = require('exceljs')

const filePath = "/home/aryaskumar/Downloads/download.xlsx"
const searchText = "Mango"
const replaceText = "IPhone"
let replaceTextDetails = { searchText: "Mango", replaceText: "IPhone"}
let changeFieldDetails = { fruitName: "Apple", column: "price", value: 350 }

async function main() {
    const workBook = new ExcelJS.Workbook()
    await workBook.xlsx.readFile(filePath)
    const worksheet = workBook.getWorksheet('Sheet1')
    replaceTextAndSave(worksheet, replaceTextDetails)
    changefield(worksheet, changeFieldDetails)
    await workBook.xlsx.writeFile(filePath)
    console.log('File updated')
}

function replaceTextAndSave(worksheet, replaceTextDetails) {
    var searchTextLocation = findLocation(worksheet, replaceTextDetails.searchText)
    const cell = worksheet.getCell(searchTextLocation.row, searchTextLocation.col)
    cell.value = replaceTextDetails.replaceText
}

function changefield(worksheet, changeFieldDetails) {
    var fruitNameLocation = findLocation(worksheet, changeFieldDetails.fruitName)
    var columnLocation = findLocation(worksheet, changeFieldDetails.column)
    const cell = worksheet.getCell(fruitNameLocation.row, columnLocation.col)
    cell.value = changeFieldDetails.value
}

function findLocation(worksheet, textValue) {
    let location = { row: -1, col: -1 }
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell, cellNumber) => {
            if (cell.value === textValue) {
                location.row = rowNumber
                location.col = cellNumber
            }
        })
    })
    if (location.row === -1 || location.col === -1) {
        console.log("Text not found")
        return {}
    }
    else return location
}

main();