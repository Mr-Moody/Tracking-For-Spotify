function update_tracking(button_object){
    window.term = button_object.id

    document.getElementById("short_term").style.backgroundColor = "#242424"
    document.getElementById("medium_term").style.backgroundColor = "#242424"
    document.getElementById("long_term").style.backgroundColor = "#242424"

    button_object.style.backgroundColor = "#353535"

    $.ajax({
        url: "/update-song-table",
        type: "POST",
        data: JSON.stringify({"date_range":term}),    
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            format_table(response["tracking_table"]);
        }
        });
};

function format_table(track_details){
    var table = document.getElementById("table_body");
    
    for (var i = 0, row; row = table.rows[i]; i++) {
        row.cells[0].innerHTML = "<div class='stats_graph_button' id=" + track_details[i]["id"] + " onclick='view_tracking_history(this)'><ion-icon class='stats_graph_icon' name='stats-chart-outline'></ion-icon></div>"
        row.cells[1].innerText = track_details[i]["index"];
        row.cells[2].innerHTML = "<img src="+ track_details[i]["cover_art"] + " id='cover_art'>";
        row.cells[3].innerText = track_details[i]["track_name"];
        row.cells[4].innerText = track_details[i]["track_album"];
        row.cells[5].innerText = track_details[i]["track_artists"];
     };
};
