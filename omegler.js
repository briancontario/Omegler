$(document).ready(function () {
 
    var paused = false;
    var pause = $("<button id='pausebutton'>Pause Omegler</button>").bind('click', function(){
        paused = !paused;
        $(this).text(paused && 'Unpause Omegler' || 'Pause Omegler');
    });
    var greeting = $("<button>Change Greeting</button>").bind('click', function(){
        chrome.storage.sync.get("text", function (val) {
            var newGreeting = prompt('Please enter a new greeting:', val["text"]||'');
            if (newGreeting !== null) {
                var delay = prompt('Please enter an optional delay before sending in seconds', 0.5);
                chrome.storage.sync.set({"text": newGreeting});
                chrome.storage.sync.set({"delay": delay});
            }
        });
    });
    $("#tagline").html('').prepend(pause).append(greeting);

    $("#textbtn").click(function start(){
        console.log("[debug] start");
        chrome.storage.sync.get("text", function (val) {
            write(val["text"],true);
        });
    });

    function write(msg, delay) {
        $(".chatmsg", document).html(msg);
        if ($(".sendbtn", document).is(":disabled")) {
            return setTimeout(function () {
                write(msg);
            }, 200);
        }
        stopper = 0;
        
        setTimeout(function(){
            $(".statuslog:first", document).html(new Date() + "<br>" + $(".statuslog:first", document).html());
            $(".sendbtn", document).click();
        }, delay || 0);
    }

    function reconnect(double){
        stopper = 1;
        msgCount = 0;
        clearInterval(timeout);
        $(".disconnectbtn", document).click();
        if (double) {
            $(".disconnectbtn", document).click();
            $(".disconnectbtn", document).click();
        }
        chrome.storage.sync.get({text:'Hello there!', delay: 0 }, function (val) {
            write(val.text, val.delay);
        });
    }

    var msgCount = 0;
    var stopper = 0;
    var timeout = 0;

    document.addEventListener("DOMSubtreeModified", function (event) {

        if ($('.strangermsg').length > msgCount) {
            console.log("[debug] countmessage");
            msgCount = $('.strangermsg').length;

            // Enable pause on the 3rd stranger message if paused is off 
            // so we don't lose our chat log once we've chatted a while
            if (msgCount == 3 && !paused)
                $("#pausebutton").click(); 
        }
        if(stopper == 0 && $(".newchatbtnwrapper").is(":visible")){
            console.log("[debug] reconnect button show up");
            if (!paused)
                reconnect();
        }

    });

});
