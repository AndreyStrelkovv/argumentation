//                   Methods to clear the discussion

/* 
*  Delete all the proposals and discussions
*  from the web page and from the database
*/
function clear_proposals(){
    window.location.reload(true);
    clear_db();
}

/* 
*  Send a post request to clear the
*  database of proposals
*/
function clear_db(){
    const options = {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: ""
    };
    fetch('/clear', options);
}

//-----------------------------------------------------------------------------------------

//                  Web Page Interaction


/**
* Add new proposal to the discussion
* @param txt (content/text of the proposal)
*/
async function addProposal(txt){

    // create not completed proposal object
    var proposal = {
        _id: "",
        title: "Proposal ",
        type: "proposal",
        score: 0,
        date: 0,
        content: txt.value,
        comments: []
    };

    // create object to sent to the server
    console.log(proposal);
    const options = {
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposal)
    };

    console.log(options.body);
    // send new proposal to the server to be completed and saved
    const response = await fetch('/proposal', options);
    // get completed proposal object
    proposal = await response.json();

    // console.log(proposal);
    txt.value = '';
    // display proposal on the web page
    display_prop(proposal)
}

/*
* Display all proposals on the web page
*/
async function display_proposals(){
    // get all proposal s from the database
    const response = await fetch('/api');
    const data = await response.json();
    proposals = data.data;
    // console.log(proposals);
    
    // display every proposal on the web page
    for (let proposal of proposals) {
        display_prop(proposal);
    }
}

/**
* Cast a vote for a proposal by:
* changing score of the proposal on the database;
* changing visual score on the web page;
* @param id of the proposal
*/
async function vote_proposal(id){
    // create request to the server to fetch proposal
    const options = {
        method: 'Post',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({thread_id : id})
    };

    // using post request to be able to send the body, to send the id of the proposal
    // request the proposal from the database via post request.
    const response = await fetch('/get_proposal', options);
    var proposal = await response.json();

    // create request to erver to update proposal
    const options_2= {
        method: 'Post',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify([proposal, {thread_id : id}, {action : "vote_proposal"}])
    };
    
    // using post request update the vote score of the proposal on the database
    const response_2 = await fetch('/update_proposal', options_2);
    const last_response = await response_2.json();

    // update the visual score of the proposal on the web page in every place.
    if( document.getElementById("score_proposal_" + id + "_" + "quad")){
        document.getElementById("score_proposal_" + id + "_" + "quad").innerHTML = "score: " + (proposal.score + 1);
    }
    if(document.getElementById("score_proposal_" + id + "_" + "quad_v")){
        document.getElementById("score_proposal_" + id + "_" + "quad_v").innerHTML = "score: " + (proposal.score + 1);
    }
    document.getElementById("score_proposal_" + proposal._id).innerHTML = "score: " + (proposal.score + 1);
}

/**
* Create visual representation of proposal to diaplay on the web page 
* @param proposal
* @param framework if given
* @return html representation of the proposal
*/
function create_proposal(proposal, framework){
    var html = '';
    // if framework is given then create display for the framework
    // else create usual proposal display
    if(framework != null){
        html = `
        <div class="full_width">
            <div class="left">
                <h4 class="title">
                    ${framework}
                </h4>
                <div class="bottom">
                    <p class="scores" id="score_proposal_${proposal._id}_${framework}">
                        score : ${proposal.score}
                    </p>
                </div>
            </div>
            <div class="right">
                <button class="view" onclick="view_proposal(${proposal._id})">View</button>
                <button onclick="vote_proposal(${proposal._id})">Vote</button>
            </div>
        </div>
        <div class="content_result">
            <p>
                ${proposal.content}
            </p>
        </div>
        `
    } else {
        html = `
        <div class="full_width">
            <div class="left">
                <h4 class="title">
                    ${proposal.title}
                </h4>
                <div class="bottom">
                    <p class="scores" id="score_proposal_${proposal._id}">
                        score : ${proposal.score}
                    </p>
                    <p class="scores" id="quad_proposal_${proposal._id}">
                        quad : 0
                    </p>
                    <p class="scores" id="quad_v_proposal_${proposal._id}">
                        quad-v : 0
                    </p>
                </div>
            </div>
            <div class="right">
                <button class="view" onclick="view_proposal(${proposal._id})">View</button>
                <button onclick="vote_proposal(${proposal._id})">Vote</button>
            </div>
        </div>
        <div class="content">
            <p>
                ${proposal.content}
            </p>
        </div>
        `
    }
    return html;
}

/**
 * Go to the web page of the proposal
 * @param proposal_id
 */
function view_proposal(proposal_id){
    // change to web page to
    window.location.href = `thread.html?${proposal_id}`;
}

/**
 * Display the proposal on the web page
 * @param proposal 
 */
function display_prop(proposal){
    // get the display field
    var container = document.getElementById('list_of_proposals');

    // create visual representation of the proposal
    var html = `
    <div class="row">
        ${create_proposal(proposal, null)}
    </div>
    `
    // display proposal on the web page
    container.insertAdjacentHTML('beforeend', html);
}


/**
 * Display proposal that was evaluated by the given framework as the best
 * @param proposal 
 * @param framework 
 */
function most_popular_proposal(proposal, framework){
    // get the display field
    var container = document.getElementById('results');

    // create visual representation of the proposal
    var html = `
    <div id="prop_${framework}" class="most_popular_proposal">
        ${create_proposal(proposal, framework)}
    </div>
    `
    // display proposal on the web page
    container.insertAdjacentHTML('beforeend', html)    
}


//------------------------------------------------------------------------------------------

//                      Evaluate Proposals


/**
 * Evaluate all the propsals using QuAD and QuAD-V frameworks
 */
function eval(){
    quad_v();
    quad();
}

/**
 * Attach the scores given by the framework to the proposals on the web page
 * @param scores_list 
 * @param framework 
 */
function attach_scores(scores_list, framework){
    for (let pair of scores_list){
        score = pair[0];
        proposal = pair[1];
        document.getElementById(`${framework}_proposal_${proposal._id}`).textContent = `${framework} : ${score}`;
    }
}


//------------------------------------------------------------------------------------------


/**
 * Evaluate all the proposals using QuAD-V framework
 */
async function quad_v(){
    // get the list all the proposals from the database
    const response = await fetch('/api');
    const data = await response.json();
    const proposals = data.data;

    // list of [score, proposal] pairs
    scores_list = []

    var greatest_score = null;
    var greatest_proposal = null;

    // for every proposal 
    for (var proposal of proposals){
        // score of the proposal
        var score = 0;
        for (var arg of proposal.comments){
            // find score of it's arguments from votes
            arg_score_v(arg);

            // add score of the argument to the score of the proposal
            if (arg.type === "support"){
                score += arg.score;
            } else {
                score -= arg.score;
            }
        }

        // add the [score, proposal] pair to the list
        scores_list.push([score, proposal]);

        if(greatest_score < score || greatest_score == null){
            greatest_score = score;
            greatest_proposal = proposal;
        }
    }

    // display scores of proposals
    attach_scores(scores_list, 'quad_v');

    // if there is a greatest, proposal then display it
    if (greatest_proposal){
        most_popular_proposal(greatest_proposal, 'quad_v');
    }
}

/**
 * Calculate score of an argument using voted score
 * @param arg an argument
 */
function arg_score_v(arg){
    // calcualte score of every child argument of argument arg
    for (var argument of arg.comments){
        arg_score_v(argument);
    }

    // calculate score of arg by adding scores of its child arguments
    for (var argument of arg.comments){
        if (argument.type === "support"){
            arg.score += 0.5 * argument.score;
        } else if(argument.type === "oppose") {
            arg.score -= 0.5 * argument.score;
        }
    }

    // if score of arg is less then 0, then change it to 0
    if (arg.score < 0){
        arg.score = 0;
    }
}


//------------------------------------------------------------------------------------------


/**
 * Evaluate all the proposals using QuAD framework
 */
async function quad(){
    // get the list all the proposals from the database
    const response = await fetch('/api');
    const data = await response.json();
    const proposals = data.data;

    // list of [score, proposal] pairs
    scores_list = []

    var greatest_score = null;
    var greatest_proposal = null;

    // for every proposal
    for (var proposal of proposals){
        // score of the proposal
        var base_score = 0;
        for (var arg of proposal.comments){

            // find score of it's arguments from the base score of the argument
            arg_score(arg);

            // add score of the argument to the score of the proposal
            if (arg.type === "support"){
                base_score += arg.base_score;
            } else {
                base_score -= arg.base_score;
            }
        }

        // add the [score, proposal] pair to the list
        scores_list.push([base_score, proposal]);


        if(greatest_score < base_score || greatest_score == null){
            greatest_score = base_score;
            greatest_proposal = proposal;
        }
    }

    // display scores of proposals
    attach_scores(scores_list, 'quad');

    // if there is a greatest, proposal then display it
    if (greatest_proposal){
        most_popular_proposal(greatest_proposal, 'quad');
    }

}


/**
 * Calculate score of an argument using base score
 * @param arg an argument
 */
function arg_score(arg){

    // calcualte score of every child argument of argument arg
    for (var argument of arg.comments){
        arg_score(argument);
    }

    // calculate score of arg by adding scores of its child arguments
    for (var argument of arg.comments){
        if (argument.type === "support"){
            arg.base_score += 0.5 * argument.base_score;
        } else if(argument.type === "oppose") {
            arg.base_score -= 0.5 * argument.base_score;
        }
    }

    // if score of arg is less then 0, then change it to 0
    if (arg.base_score < 0){
        arg.base_score = 0;
    }
}