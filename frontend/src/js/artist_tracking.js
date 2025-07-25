function update_tracking(button_object){
    if (button_object == null){
        window.term = "short_term"
    }
    else {
        window.term = button_object.id

        //sets all of the time selector buttons to be greyed out
        document.getElementById("short_term").style.backgroundColor = "#242424"
        document.getElementById("medium_term").style.backgroundColor = "#242424"
        document.getElementById("long_term").style.backgroundColor = "#242424"

        //makes selected time range highlighted with a lighter grey 
        button_object.style.backgroundColor = "#353535"

        //called from table object so used to make sure proper date_range is sent
        if (window.term == "table_body") {
            window.term = "short_term";
    };
    };


    $.ajax({
        url: "/update-artist-table",
        type: "POST",
        data: JSON.stringify({"date_range":window.term}),    
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            format_table(response["tracking_table"]);
        }
        });
};

function format_table(track_details){
    const row_width = 5;
    table_object = document.getElementById("table_body");

    for (var i = 0, artist; artist = track_details[i]; i++){
        const artist_div = document.createElement("div");
        artist_div.classList.add("artist_holder");
        artist_div.id = artist["artist_name"];

        //create image holder div and add image element
        const image_holder_div = document.createElement("div");
        image_holder_div.classList.add("image_holder");
        const image = document.createElement("img");
        image.src = artist["artist_profile"];
        image.id = "artist_profile";
        image_holder_div.appendChild(image);

        //create cell div for artist index and name
        const cell_div = document.createElement("div");
        cell_div.classList.add("cell");
        cell_div.textContent = `${artist['index']}. ${artist['artist_name']}`;


        const tracking_div = document.createElement("div");
        tracking_div.className = "stats_graph_button";
        tracking_div.id = artist["id"];
        tracking_div.onclick = function(){view_tracking_history(tracking_div);};

        const tracking_icon = document.createElement("ion-icon");
        tracking_icon.className = "stats_graph_icon";
        tracking_icon.name = "stats-chart-outline";

        tracking_div.appendChild(tracking_icon);

        //append image holder and cell divs to the main artist div
        artist_div.appendChild(image_holder_div);
        artist_div.appendChild(cell_div);
        artist_div.appendChild(tracking_div);

        row = Math.floor(i/row_width);
        column = i - row*row_width;

        //used to remove 0 indexing error as table starts from 1,1
        row = row + 1;
        column = column + 1;

        artist_div.style.gridRow = row;
        artist_div.style.gridColumn = column;

        table_object.appendChild(artist_div);

    };
};

update_tracking()
