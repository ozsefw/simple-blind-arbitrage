const EventSource = require('eventsource');
const config = require('./utils/config.json')

async function subscribe_mm(){
}

async function main(){
    let MatchMaker = new EventSource(config.mainnetMatchMaker)
    // let MatchMaker = new EventSource("http://127.0.0.1:8080/sse");

    MatchMaker.onmessage = async (event) => {
        if (event.type == 'message'){
            var msg = JSON.parse(event.data);
            msg["ts"] = Date.now()
            console.log(JSON.stringify(msg, null, 2));
        }
        else{
            event["ts"] = Date.now()
            console.log(event)
        }
    };

    MatchMaker.onerror = (error) => {
        console.error("on errer: ", error);
    }

    console.log("set interval");

    setInterval(()=>{
        // console.log("state", MatchMaker.readyState);
        console.log("state: %s", MatchMaker.readyState);
    }, 30000)

    // console.log("main end");
}

main()