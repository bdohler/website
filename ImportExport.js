//Saves the contents of the file into one single JS string entireSaveFileContents
//Hints at parsing, but does not do
function readBlob() {

	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		alert('The File APIs are not fully supported in this browser.');
	}


    var files = document.getElementById('files').files;
    if (!files.length) {
    	alert('Please select a file!');
    	return;
    }

    var file = files[0];
    var start = 0;
    var stop = file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        document.getElementById('file_content').textContent = evt.target.result;
        entireSaveFileContents = evt.target.result;
      }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
	document.getElementById('status').textContent = 'Read Save File Complete';
}

//On pressing export, runs concatenateSaveFile and generates a download for the user to select
function exportToCSV() {
    var data = pool;
    var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
    window.open(url, '_blank');
    window.focus();
}

//Builds and returns a string object
function buildSaveFile() {
	var newSaveFile
    var person = {
    name: "Jim Cowart",
    location: {
        city: {
            name: "Chattanooga",
            population: 167674
        },
        state: {
            name: "Tennessee",
            abbreviation: "TN",
            population: 6403000
        }
    },
    company: "appendTo",
	};
	newSaveFile = JSON.stringify(person, null, 4);
    return newSaveFile;
}

//
function parseSaveFile() {

	return;
}


