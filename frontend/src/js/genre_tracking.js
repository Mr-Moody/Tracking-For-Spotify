function update_tracking(button_object){
    console.log("updating table");

    if (button_object == null){
        window.term = "short_term"
    }
    else {
        window.term = button_object.id

        document.getElementById("short_term").style.backgroundColor = "#242424"
        document.getElementById("medium_term").style.backgroundColor = "#242424"
        document.getElementById("long_term").style.backgroundColor = "#242424"

        button_object.style.backgroundColor = "#353535"

        //called from table object so used to make sure proper date_range is sent
        if (window.term == "table_body") {
            window.term = "short_term";
    };
    };

    $.ajax({
        url: "/update-genre-table",
        type: "POST",
        data: JSON.stringify({"date_range":window.term}),    
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            format_table(response["genres"]);
        }
        });
};

function format_table(track_details){
    table_object = document.getElementById("table_body");
    max_width = track_details[0]["value"];
    table_object.innerHTML = ""



    for (var i = 0; genre = track_details[i]; i++){
        rank = i + 1;

        const genre_holder_div = document.createElement("div");
        genre_holder_div.classList.add("genre_holder");

        const tracking_div = document.createElement("div");
        tracking_div.className = "stats_graph_button";
        tracking_div.id = genre["name"];
        tracking_div.onclick = function(){view_tracking_history(tracking_div);};
        tracking_div.style.gridRow = rank;
        tracking_div.style.gridColumn = 1;

        const tracking_icon = document.createElement("ion-icon");
        tracking_icon.className = "stats_graph_icon";
        tracking_icon.name = "stats-chart-outline";
        tracking_div.appendChild(tracking_icon);

        const genre_name = document.createElement("div");
        genre_name.classList.add("genre_name");
        genre_name.innerText = rank + ". " + genre["name"]
        genre_name.style.gridRow = rank;
        genre_name.style.gridColumn = 2;

        const genre_bar = document.createElement("div");
        genre_bar.classList.add("genre_bar");
        genre_bar_width = Math.round(genre["value"] / max_width * 100);
        console.log(genre_bar_width);
        genre_bar.style.width = genre_bar_width + "%";
        genre_bar.style.gridRow = rank;
        genre_bar.style.gridColumn = 3;


        // Append image holder and cell divs to the main artist div
        genre_holder_div.appendChild(tracking_div);
        genre_holder_div.appendChild(genre_name);
        genre_holder_div.appendChild(genre_bar);

        table_object.appendChild(genre_holder_div);

    };
};

update_tracking()
