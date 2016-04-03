function exportToCsv() {

	concatenateSaveFile();
    var myCsv = newSaveFile;
    window.open('data:text/csv;charset=utf-8,' + escape(myCsv));

}

var button = document.getElementById('e');
button.addEventListener('click', exportToCsv);