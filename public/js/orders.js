$(document).ready(function() {
setInterval(function(){
  //window.location.reload();
  updates();
}, 5000);
});

async function completeOrder(identifier) {
  const line = $(identifier);
  const piID= line.attr("value");
  console.log(piID);
  line.prop("style", "--i: 5");
  line.prop("onclick", null).off("click");
  line.prependTo("#ready");
  const response = await fetch(`/complete_order?payment_intent_id=${piID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  }

  function newLI(lineInfo)
  {
    var li = $("<li></li>");
    const piID = lineInfo.payment_intent_id
    li.prop("style", "--i: 2")
    li.attr("value", piID);
    li.attr("onclick", "completeOrder(this)");
    var div = $("<div></div>");

    var divr = $(`<div class="right"></div>`);

    lineInfo.order.forEach(item => {
      var par = $(`<p>${item.quantity} x ${item.name}</p>`);
      divr.append(par);
    });

    var divl = $(`<div><h3>${lineInfo.name}</h3><br></div>`);
    div.append(divr);
    div.append(divl);
    li.append(div);
    return li;
  }
  async function updates() {
    const response = await fetch(`/payment_intents`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const jsonResponse = await response.json();
    const list = $("#prep");
    list.empty();
    jsonResponse.forEach(line => {
      if(!line.completed)
      {
        list.append(newLI(line));
      }
    });
  console.log(list);
    }