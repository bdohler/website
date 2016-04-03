
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.

  	var entireSaveFileContents = null; 
	var importButton = document.getElementById('i');

	importButton.addEventListener('click', function() {
		readBlob();
		parseSaveFile();
	});

	
	function readBlob() {

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

} 

else {
	alert('The File APIs are not fully supported in this browser.');
}

