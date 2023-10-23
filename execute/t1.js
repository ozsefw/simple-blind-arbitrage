const EventSource = require('eventsource');
const config = require('./utils/config.json')

async function subscribe_mm(){
    var count = 0;
    let MatchMaker = new EventSource(config.mainnetMatchMaker)
    // let MatchMaker = new EventSource("http://127.0.0.1:8080/sse");

    MatchMaker.onmessage = async (event) => {
        count += 1;
        if (event.type == 'message'){
            var msg = JSON.parse(event.data);
            msg["ts"] = Date.now()
            console.log(JSON.stringify(msg, null, 2));
        }
        else{
            event["ts"] = Date.now()
            console.log(event)
        }
        if(count>10){
            MatchMaker.close();
        }
    };

    MatchMaker.onerror = (error) => {
        console.error("on errer: ", error);
    }
}

async function main(){
    let MatchMaker = new EventSource(config.mainnetMatchMaker)
    // let MatchMaker = new EventSource("http://127.0.0.1:8080/sse");

    var count = 0;
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
        count += 1;
        if (count > 10){
            console.log("close");
            MatchMaker.close();
        }
    };

    MatchMaker.onerror = (error) => {
        console.error("on errer: ", error);
    }

    setInterval(()=>{
        console.log("state: %s", MatchMaker.readyState);
    }, 30000)

    // await subscribe_mm();
    console.log("main end");
}

main()