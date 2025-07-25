function detect_mobile() {
  const toMatch = [ //set list of most commonly used phone operating systems
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];
  
  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
};

if (detect_mobile()){
  var main_sheet = document.styleSheets[0]; //global style sheet for every page
  var second_sheet = document.styleSheets[1]; //local style sheet for specific page being used

  second_sheet.insertRule("* {font-size: x-large;}") //changes the text to a larger font
  second_sheet.insertRule("img#cover_art {height: 100px; width: 100px;}") //increases the album cover image size for the songs in the webpage
};


function get_currently_playing(){
    $.ajax({
        url: "/currently-playing",
        type: "POST",   
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var current_box = document.getElementById("currently_playing_box");
            
            if ("error" in response["current"] || response["current"]["currently_playing_type"] == "episode"){ //checks if response is an error or podcast instead of song
                current_box.style.visibility = "hidden";
                console.log(response["current"]["error"])
            }
            else{
                update_currently_playing(response["current"]);
                current_box.style.visibility = "visible";
                return response;
            };
           
        }
        });
};

function update_currently_playing(current){
    document.getElementById("currently_playing_box").style.visibility = "visible";
    
    cover_art = current["item"]["album"]["images"][0]["url"];
    song_name = current["item"]["name"];
    artist_name = current["item"]["artists"][0]["name"];
    album_name = current["item"]["album"]["name"];

    var current_art = document.getElementById("current_song_image");
    current_art.src = cover_art;

    var current_name = document.getElementById("current_song_name");
    current_name.innerHTML = song_name + " - " + artist_name;


    var current_album = document.getElementById("current_song_album");
    current_album.innerHTML = album_name;
};

get_currently_playing();
setInterval(function() {
    get_currently_playing();
}, 10000);


//logs out the users spotify account and displays the sign out page, then automatically closes the page after 1.5s
function sign_out(){
    let params = "scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no";
    let closeWindow = window.open("https://accounts.spotify.com/en/logout",params);
    setTimeout (function closeTab(){
    closeWindow.close();
    window.location.assign("/sign-out");
    },1500);

};


//opens the side panel
function open_settings() {
    const side_panel = document.getElementById("side_panel");
    side_panel.style.visibility = "visible";
    

    // adjusts width so that on mobile the settings panel is easier to read
    if (detect_mobile()){
        side_panel.style.width = "60%";
    }
    else {
        side_panel.style.width = "30%";
    };

   
};
  
//hides the side panel
function close_settings() {
    const side_panel = document.getElementById("side_panel");
    side_panel.style.visibility = "hidden";
    side_panel.style.width = "0px";
    
};

//redirect to main spotify website
function open_spotify_website(){
    window.open("https://open.spotify.com/");
};

//open page of specific spotify page
function open_spotify_song_website(external_url){
    window.open(external_url);
};

//opens the user's account in a new tab
function open_user_spotify_account(){
    let user = JSON.parse('{{ user | tojson }}');
    var web_url = user["external_urls"]["spotify"];
    window.open(web_url);
};

function get_user_profile(user){
    image_object = document.getElementsByClassName("user_profile");
    if (user["images"][1]["url"] != null) {
      image_object.src = user["images"][1]["url"];
    } 
    else{
        image_object = "<ion-icon class='user_profile' name='person-outline'></ion-icon>"; //If the user has no profile picture, then a default empty profile image will be shown instead
    };
};

function view_tracking_history(graph_button){
    var file_name = location.href.split("/").slice(-1)[0]; //file name example is "song-tracking"
    element_type = file_name.split("-")[0]; //element type example is the "song" from "song-tracking"

    $.ajax({
        url: "/tracking-graph", //the url which the server will process the request
        type: "POST",
        data: JSON.stringify({"type":element_type, "term":window.term, "id":graph_button.id}),   //tells the server which graph is being tracked
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            const canvas = document.getElementById("graph_canvas");
            create_graph(canvas, response["dates"], response["ranks"]); //creates a graph with the received dates and ranks
        }
        });
}

function create_graph(canvas, dates, ranks) {
    if (window.chart){ //checks if a graph current exists
        window.chart.destroy(); //removes the graph so that graphs dont overlap
    }
    // Creates a new graph to place within the canvas in the graph holder
    window.chart = new Chart(canvas, { 
        type: "line",
        data: {
            datasets: [{
                fill: false,
                data: ranks,
                backgroundColor: "#1DB954",
                borderColor: "#1DB954",
                }],
                labels: dates,
        },
        options: {
            scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true,
                    min: 1, //sets lowest value to 1 not 0
                    reverse: true, //displays 1 at top of graph
                    callback: function(value) {if (value % 1 === 0) {return value;}} //makes sure there are only integer values for the y axis
                  }
                }],
                xAxes: [{
                    ticks: {
                        maxTicksLimit: 8.1
                    }
                }],
                grid: {
                    lineWidth: 2
                }
              },
            }
        });
    
    const graph_holder = document.getElementById("graph_holder");
    graph_holder.style.visibility = "visible" //displays the graph
    graph_holder.style.height = "300px"; //makes the box scale to set height and width
    graph_holder.style.width = "400px";
    graph_holder.style.transition = "0.5s"; //opening animation for 0.5s

};

function close_graph(){
    window.chart.destroy() //removes the graph so that graphs dont overlap
    const graph_holder = document.getElementById("graph_holder");
    graph_holder.style.visibility = "hidden" //hides the graph
    graph_holder.style.height = "0px"; //sets the box to have 0 height and width
    graph_holder.style.width = "0px";
    graph_holder.style.transition = "0s"; //no closing animation
}

window.term = "short_term"