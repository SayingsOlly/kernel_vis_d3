function handleFileSelect_list(evt){

var files = evt.target.files; // FileList object.

    // files is a FileList of File objects. List some properties.
  var output = [];
  var fname = "";
  for (var i = 0, f; f = files[i]; i++) {
    fname = f.name;
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
    }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

  console.log(fname);
  if(fname != ""){
    readFile(fname);
  }


}

function handleFileSelect(evt){
  evt.stopPropagation();
  evt.preventDefault();

var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
  var output = [];
  var fname = "";
  for (var i = 0, f; f = files[i]; i++) {
    fname = f.name;
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
    }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

  console.log(fname);
  readFile(fname);

}

function handleDragover(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

var dropZone = document.getElementById('drop_zone');
//dropZone.addEventListener('dragover', handleDragover, false);
//dropZone.addEventListener('drop', handleFileSelect, false);
document.getElementById('files').addEventListener('change', handleFileSelect_list, false);
