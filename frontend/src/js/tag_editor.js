function create_tag(){
    tag_name = document.getElementById("tag_name").value;
    tag_description = document.getElementById("tag_description").value;
    tag_colour = document.getElementById("tag_colour").value;

    console.log(tag_name, tag_description, tag_colour);

    $.ajax({
        url: "/create-tag",
        type: "POST",
        data: JSON.stringify({"tag_name":tag_name, "tag_description":tag_description, "tag_colour":tag_colour}),    
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {

            if (response["error"] != ""){
                show_alert_box("Error:\n" + response["error"]);
            }

            else{
                tags = get_all_tags();
                update_tags(tags);
            }
        }
        });
};

function update_tags(tags){
    const tag_list = document.getElementById("user_current_tags");
    tag_list.innerHTML = "";

    tags.forEach(tag_details => {
        const tag_li = document.createElement("li");
        tag_li.classList.add("tag");
        tag_li.innerText = tag_details["name"];
        tag_li.id = tag_details["colour"];
        tag_li.title = tag_details["description"];
        tag_li.onclick = function(){ 
            enable_tag(tag_li);
        };

        tag_li.addEventListener("contextmenu", function(event){
            event.preventDefault();
            const tag_menu = document.getElementById("tag_menu");
            tag_menu.style.display = "block";
            open_tag_menu(event);
            window.right_clicked_tag = tag_li;
        },false);

        tag_li.addEventListener("click", function(event){
            event.preventDefault();
            hide_tag_menu()
        },false);

        tag_list.appendChild(tag_li);
    });
};

function get_all_tags(){
    $.ajax({
        url: "/get-all-tags",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            tags = response["tags"];
            update_tags(tags)
        }
        });
};

function enable_tag(tag){
    const index = window.enabled_tags.indexOf(tag.innerText);

        if (index > -1) { // only splice array when item is found
            window.enabled_tags.splice(index, 1); // 2nd parameter means remove one item only
            tag.style.backgroundColor = "#353535";
            
        }
        else{
            window.enabled_tags.push(tag.innerText);
            tag.style.backgroundColor = tag.id;
        }

}

function show_tag_form(){
    const tag_form = document.getElementById("tag_creator");
    tag_form.style.visibility = "visible";
    tag_form.style.opacity = 100;
}

function hide_tag_form(){
    const tag_form = document.getElementById("tag_creator");
    tag_form.style.visibility = "hidden";
    tag_form.style.opacity = 0;
}

function open_tag_menu(event){
    const tag_menu = document.getElementById("tag_menu");
    const tag_menu_item = document.getElementById("tag_menu_item");
    tag_menu_item.style.visibility = "visible";
    tag_menu.style.visibility = "visible";

    tag_menu.style.top = mouseY(event) + 'px';
    tag_menu.style.left = mouseX(event) + 'px';
}

function hide_tag_menu(){
    const tag_menu = document.getElementById("tag_menu"); //hides the right click menu holder
    const tag_menu_item = document.getElementById("tag_menu_item"); //holds the individual buttons for the menu holder
    tag_menu.style.visibility = "hidden";
    tag_menu_item.style.visibility = "hidden";

}

function mouseX(evt) {
    if (evt.pageX) {
        return evt.pageX;
    } else if (evt.clientX) {
        return evt.clientX + (document.documentElement.scrollLeft ?
        document.documentElement.scrollLeft :
        document.body.scrollLeft);
    } else {
        return null;
    }
    }

    function mouseY(evt) {
    if (evt.pageY) {
        return evt.pageY;
    } else if (evt.clientY) {
        return evt.clientY + (document.documentElement.scrollTop ?
        document.documentElement.scrollTop :
        document.body.scrollTop);
    } else {
        return null;
    }
}

function show_alert_box(error_message){
    const alert_box = document.getElementById("alert_box");
    alert_box.firstChild.data = error_message;
    alert_box.style.visibility = "visible";
    alert_box.style.opacity = 100;
}

function hide_alert_box(){
    const alert_box = document.getElementById("alert_box");
    alert_box.firstChild.data  = "";
    alert_box.style.visibility = "hidden";
    alert_box.style.opacity = 0;
}

function delete_tag(){
    hide_tag_menu();

    tag_name = window.right_clicked_tag.innerText
    tag_colour = window.right_clicked_tag.id
    tag_description = window.right_clicked_tag.title

    $.ajax({
        url: "/delete-tag",
        type: "POST",
        data: JSON.stringify({"tag_name":tag_name, "tag_colour":tag_colour, "tag_description":tag_description}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            tags = response["tags"];
            update_tags(tags);
        }
    });
}

window.enabled_tags = []
get_all_tags()
