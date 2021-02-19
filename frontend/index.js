const button = document.querySelector('.button');
const submit = document.querySelector('.submit');

function toggleClass() {
    this.classList.toggle('active');
}

function addClass() {
    this.classList.add('finished');
}

button.addEventListener('click', toggleClass);
button.addEventListener('transitionend', toggleClass);
submit.addEventListener('transitionend', addClass);

$(document).ready(function () {

    // FETCHING DATA FROM JSON FILE 
    $.getJSON("https://xmeme-dep-backend.herokuapp.com/memes",
        function (data) {
            var template = '<div class="feed"><h1>Meme Feed</h1></div>';

            // ITERATING THROUGH OBJECTS 
            $.each(data, function (key, value) {

                //CONSTRUCTION OF ROWS HAVING 
                // DATA FROM JSON OBJECT 
                let temp = String(value._id) + " form-row";
                template += '<div class="meme-template ">';
                let memeCaption=value.caption.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                let memer=value.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                template += ' <div class="template-stuff"><h2> Posted by: ' + memer + '</h2></div>';
                template += '<div class="template-stuff"><h4>' + memeCaption+ '</h4></div>';
                template += '<div class="image">';
                template += '<img src="' + value.url + '" alt="Image not found"></div>';
                template += '<div class=\'' + temp + '\'><button id=' + String(value._id) + ' type="button" class="btn btn-primary"  onclick="edit(this.id)" ><i class="fas fa-edit"></i></button>';
                template += '<button  type="button" class="btn btn-primary"  onclick="deleteMeme(' + value._id + ')" ><i class="fas fa-trash-alt"></i></button>';
                template += '<a href='+value.url+' target="blank"><button  type="button" class="btn btn-primary"  ><i class="fas fa-download"></i></button></a></div>';
                template += '</div>';


            });

            //INSERTING ROWS INTO TABLE  
            $('.meme-list').append(template);
        });
});
function topFunction(val,url) {
    $('.' + String(val)).empty();
    let rewind = '<button id=' + String(val) + ' type="button" class="btn btn-primary"  onclick="edit(this.id)" ><i class="fas fa-edit"></i></button>';
    rewind += '<button  type="button" class="btn btn-primary"  onclick="deleteMeme(' + parseInt(val)+ ')" ><i class="fas fa-trash-alt"></i></button>';
    rewind += '<a href='+url+' target="blank"><button  type="button" class="btn btn-primary"  ><i class="fas fa-download"></i></button></a>';


    $('.' + String(val)).append(rewind);

}
function edit(val) {
    //console.log(val);

    $('#' + String(val)).remove();
    $.getJSON("https://xmeme-dep-backend.herokuapp.com/memes/" + String(val),
        function (data) {
            //console.log(data);
            let imageUrl=data.url;
            let memeCaption=data.caption.replace(/</g, '&lt;').replace(/>/g, '&gt;');

            let newForm = '<div class="form-template " id=' + String(val) + '>';
            newForm+='<h3>Edit meme</h3>'
            newForm += '<form >';
            newForm += '<div class="form-row">';
            newForm += ' <label for="caption">Caption</label> <br />';
            newForm += '<input class="form-control"  type = "text" name="caption" value=\'' + memeCaption + '\' required/></div>';

            newForm += '<div class="form-row">';
            newForm += ' <label for="url">Meme url</label> <br />';
            newForm += '<input class="form-control" type = "url" name="url" value=' + data.url + ' required/></div>';
            newForm += '<input type="hidden" value=' + val + ' name="_id" />';
            newForm += '<div class="form-row">';
            newForm += '<button class="button"  type="submit"><span class="submit">Submit</span><span class="loading"><i class="fa fa-refresh"></i></span><span class="check"><i class="fa fa-check"></i></span></button>';
            newForm += '</div>';
            newForm += '</form><button onclick="topFunction('+ val + ', \''+ String(imageUrl )+ '\')"  type="button" class="btn btn-primary back"  title="Go to top"><i class="fa fa-sort-up"></i></button>'
            newForm += '</div>';

            $('.' + String(val)).append(newForm);
        });
}
function deleteMeme(val) {
    fetch('https://xmeme-dep-backend.herokuapp.com/memes/' + val, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    }).then(function (data) {
        //console.log(data);
        alert("Successfully deleted");
        location.reload();
    });

}
var serializeForm = function (form) {
    var obj = {};
    var formData = new FormData(form);
    for (var key of formData.keys()) {
        obj[key] = formData.get(key);
    }
    return obj;
};



document.getElementById('myForm').addEventListener('submit', function (event) {

    event.preventDefault();
    console.log(event.target);
    fetch('https://xmeme-dep-backend.herokuapp.com/memes', {
        method: 'POST',
        body: JSON.stringify(serializeForm(event.target)),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    }).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        //console.log(data);
        alert("Meme successfully posted");
        location.reload();
    }).catch(function (error) {
        if (error.status === 409)
            alert(error.statusText + " Duplicate entries not allowed.");
        else
            alert(error.statusText + " Enter a valid image url.");
        //console.warn(error);
        button.classList.remove("finished");
        button.classList.remove("active");
    });

});
document.getElementById('memes').addEventListener('submit', function (event) {

    event.preventDefault();
    let id = serializeForm(event.target)._id;

    fetch('https://xmeme-dep-backend.herokuapp.com/memes/' + id, {
        method: 'PATCH',
        body: JSON.stringify(serializeForm(event.target)),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    }).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response);
    }).then(function (data) {
        //console.log(data);
        alert("successfully updated");
        location.reload();
    }).catch(function (error) {
        alert(error.statusText + ". Enter a valid image url.");
        //console.warn(error);
        button.classList.remove("finished");
        button.classList.remove("active");
    });

});


