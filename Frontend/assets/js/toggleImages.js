function toggleImage() {
  var checkBox = document.getElementById("led");
  var img = document.getElementById("led-image");

  if (checkBox.checked) {
    // When the switch is ON
    img.src = "https://img.icons8.com/?size=100&id=WWRW41cpXB4o&format=png&color=000000"; // Image URL for ON state
  } else {
    // When the switch is OFF
    img.src = "https://img.icons8.com/?size=100&id=tlXZO3hU3TSG&format=png&color=000000"; // Image URL for OFF state
  }
}
function toggleImage2() {
  var checkBox = document.getElementById("fan");
  var img = document.getElementById("fan-image");

  if (checkBox.checked) {
    // When the switch is ON
    img.src = "https://img.icons8.com/?size=100&id=104278&format=png&color=000000"; // Image URL for ON state
  } else {
    // When the switch is OFF
    img.src = "https://img.icons8.com/?size=100&id=551&format=png&color=000000"; // Image URL for OFF state
  }
}
function toggleImage3() {
  var checkBox = document.getElementById("air-conditioner");
  var img = document.getElementById("air-conditioner-image");

  if (checkBox.checked) {
    // When the switch is ON
    img.src = "https://img.icons8.com/?size=100&id=30044&format=png&color=000000"; // Image URL for ON state
  } else {
    // When the switch is OFF
    img.src = "https://img.icons8.com/?size=100&id=Dj3a6QnUGYsr&format=png&color=000000"; // Image URL for OFF state
  }
}