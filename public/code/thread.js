
//                           Proposal Web Page

/**
 * Display a comment if it is directly connected to the proposal
 * @param comment 
 * @param proposal 
 */
function displayCom(comment, proposal){

    // if comment directly connected to the proposal then display
    // else display it's child comments
    if(comment._id.length == proposal._id.length+1){
        commentHtml = create_comment(comment);
        comments.insertAdjacentHTML('beforeend', commentHtml);
    } else {
        expand(comment._id.slice(0, comment._id.length - 1), proposal)
    }
}

/**
 * Display every child comment of the comment in the list of comments
 * @param comments 
 * @param proposal 
 */
async function display_comments(comments, proposal){
    for(var com of comments){
        // display child comment
        expand(com._id.slice(0, com._id.length - 1), proposal)
        // for every child comment repeat 
        display_comments(com.comments, proposal)
    }
}

/**
 * Create visual representation of the comment
 * @param comment 
 * @returns html div, visual representation of the comment
 */
function create_comment(comment){
    var commentHtml = `
    <div id="${comment._id}" class="comment">
        <div class="top-comment">
            <p class="user">
                id: ${comment._id}
            </p>
            <p id="score_${comment._id}" class="comment-ts">
                score: ${comment.score}
            </p>
            <p class="comment-ts">
                    ${comment.type}
            </p>
        </div>
        <div class="comment-content">
            ${comment.content}
        </div>
        <div>
            <button class="comment_options" id="reply" type="button" onclick="reply(${comment._id})">reply</button>
            <button class="comment_options" type="button" onclick="vote(${comment._id}, 1)">upvote</button>
            <button class="comment_options" type="button" onclick="vote(${comment._id}, -1)">downvote</button>
        </div>
    </div>`
    return commentHtml
}

/**
 * Create text area and buttons
 * for users to comment on other comments
 * @param comment_id 
 */
function reply(comment_id){
    // if reply hasn't been pressed, create reply field
    // else remove reply field
    if(document.getElementById('temp_text_area') == null){
        replyHtml = `
        <div id="temp_text_area">
        <textarea id="arg_reply"></textarea>
        <div class="com">
            <button class="oppose" type="button" onclick="
                addCom(document.getElementById('arg_reply'), ${comment_id},'oppose')">oppose</button>
            <button class="support" type="button" onclick="
                addCom(document.getElementById('arg_reply'), ${comment_id},'support')">support</button>
        </div>
        </div>
        `
        document.getElementById(comment_id).innerHTML += replyHtml
    } else {
        document.getElementById('temp_text_area').remove()
    }
}

/**
 * Dislplay all the child comments of the given comment
 * @param comment_id 
 * @param proposal 
 */
async function expand(comment_id, proposal){

    // find coment by comment id
    var comment = find_comment(proposal, comment_id, proposal._id.length+1);

    // display all the child comments
    if (comment != null){
        for(var c of comment.comments){
            if(document.getElementById(c._id) == null){
                document.getElementById(comment._id).innerHTML += create_comment(c)
            }
        }
    }
}

/**
 * Cast a vote for an argument
 * @param comment_id 
 * @param diff numerical change to the proposal
 */
async function vote(comment_id, diff){

    // find id of the current proposal
    var id = window.location.search.slice(1);

    // create a post request
    const options = {
        method: 'Post',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({thread_id : id})
    };

    // fetch the proposal from the database
    const response = await fetch('/get_proposal', options);
    var proposal = await response.json();

    // change visual display of the score of the comment
    var comment = find_comment(proposal, ""+comment_id, proposal._id.length+1);
    document.getElementById("score_" + comment._id).innerHTML = "score: " + (comment.upvote - comment.downvote + diff);
    
    // create a post request
    const options_2 = {
        method: 'Post',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify([proposal, {com_id : comment_id}, {action : "vote"}, {diff: diff}])
    };
    
    // sent a request to change the score of the proposal
    const response_2 = await fetch('/update_proposal', options_2);
}


/**
 * Recursive method to find a comment in the discussion tree.
 * 
 * @param thread 
 * @param comment_id 
 * @param depth 
 * @returns 
 */
function find_comment(thread, comment_id, depth){
    // for every child comment of a thread (a comment or a proposal)
    for (let comment of thread.comments){
        // if comment that is found is at the right depth then return comment
        // else repeat the method with the found comment
       if(comment._id == comment_id.slice(0, depth)){
          if(comment_id.length == depth){
             return comment;
          } else {
             return find_comment(comment, comment_id, depth+1);
          }
       }
    }
 }

 /**
  * Create a comment.
  * Save created comment to the databse
  * Display the comment.
  * @param txt 
  * @param parrent_comment_id 
  * @param t 
  */
async function addCom(txt, parrent_comment_id, t){

    // find current proposal 
    var id = window.location.search.slice(1);

    // create a post request to fetch proposal
    const options= {
        method: 'Post',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({thread_id : id})
    };

    // using post request to be able to send the body, to send the id of the proposal
    // request the proposal from the database via post request.
    const response = await fetch('/get_proposal', options);
    var proposal = await response.json();

    // create comment incomplete object
    var comment = {
        content: txt.value,
        score: 0,
        upvote: 0,
        downvote: 0,
        _id: "",
        parent_id: parrent_comment_id,
        type: t,
        base_score: 1,
        comments: [],
    }

    txt.value = '';
    if(document.getElementById('temp_text_area') != null){
        document.getElementById('temp_text_area').remove()
    }

    // create a post request to insert comment into the databse
    const options_2 = {
        method: 'Post',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify([proposal, comment, {action: "comment"}])
    };

    // send a post request to update the proposal information; complete and add the comment to the database
    const response_2 = await fetch('/update_proposal', options_2);

    // get the comleted comment from the databse
    const temp = await response_2.json();
    proposal = temp[0];
    comment = temp[1];

    // display the newly created comment
    displayCom(comment, proposal);
}