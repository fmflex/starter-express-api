$(document).ready(function() {
setInterval(function(){
  window.location.reload();
}, 5000);
});

async function myFunction(identifier) {
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