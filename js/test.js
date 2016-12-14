var data = [
  {"title": "Book title 1", "author": "Name1 Surname1"},
  {"title": "Book title 2", "author": "Name2 Surname2"},
  {"title": "Book title 3", "author": "Name3 Surname3"},
  {"title": "Book title 4", "author": "Name4 Surname4"}
];

// use
var csv = data.map(function(d){
    return JSON.stringify(d);
})
.join('\n')
.replace(/(^\[)|(\]$)/mg, '');

var output = "data:text/csv;charset=utf-8," + csv;

//var encodedUri = encodeURI(output);
window.open(output);
