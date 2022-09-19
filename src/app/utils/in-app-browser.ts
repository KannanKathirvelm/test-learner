const overlayColor = 'rgb(0, 0, 0, 0.8)';
const fontColor = '#ffffff';
const buttonColor = '#0072bc';
const textShadowLightColor = '.25em 0 0 rgba(0, 0, 0, 0), .5em 0 0 rgba(0, 0, 0, 0)';
const textShadowDarkColor = '.25em 0 0 white, .5em 0 0 rgba(white)';

export function inappBrowserStyles() {
  return `
  .inappBrowser {
  	height: 100%;
  	display: flex;
  	justify-content: center;
  	align-items: center;
  	font-size: 40px;
  	background: ${overlayColor};
  }

  .hidden {
  	display: none;
  }

  .loading {
  	font-size: 5rem;
  	font-weight: lighter;
  	color: ${fontColor};
  }

  .loading:after {
  	content: ' .';
  	animation: dots 1s steps(5, end) infinite;
  }

  @keyframes dots {
  	0%,
  	20% {
  		color: rgba(0, 0, 0, 0);
  		text-shadow: ${textShadowLightColor}
  	}
  	40% {
  		color: white;
  		text-shadow: ${textShadowLightColor}
  	}
  	60% {
  		text-shadow: ${textShadowDarkColor}
  	}
  	80%,
  	100% {
  		text-shadow: ${textShadowDarkColor}
  	}
  }

  .alert-container {
  	z-index: 100;
  	width: 100%;
  	height: 100%;
  	background-color: ${overlayColor};
  	display: flex;
  	align-items: center;
  	justify-content: center;
  	flex-direction: column;
  	position: fixed;
  	top: 0;
  	left: 0;
  	transition: all 500ms ease-out;
  	transform: translateY(400%);
  }

  .alert-container.display {
  	transform: translateY(0%);
  }

  .message h5 {
  	font-weight: lighter;
  	font-size: 3.5rem;
  	text-transform: initial;
  	text-align: center;
  	color: ${fontColor};
  	opacity: 0;
  	transition: all 500ms ease-out;
  }

  .alert-container h5.fade {
  	opacity: 1;
  }

  .close-button {
  	font-size: 35px;
  	background: ${buttonColor};
  	color: ${fontColor};
  	border: 0;
  	border-radius: 5px;
  	padding: 0px 20px;
  	height: 65px;
  	opacity: 0;
  }

  .close-button.fade {
  	opacity: 1;
  }`;
}

export function inAppBrowserLoading(message: string) {
  return `
  var body = document.querySelector("body");
  body.classList.add("inappBrowser");
  var loadingElement = document.createElement("p");
  loadingElement.innerHTML = "${message}";
  loadingElement.classList.add("loading");
  body.appendChild(loadingElement);
  `;
}

export function inAppBrowserPopup(message: string) {
  return `
      var loading = document.querySelector(".loading");
      if(loading){
        loading.classList.add("hidden");
      }
      var body = document.querySelector("body");
      var overlayElement = '<div class="alert-container"> <div class="message"> <h5>${message}</h5> </div> <button class="close-button">Close</div>" </div>'
      body.insertAdjacentHTML( 'beforeend', overlayElement );
      var buttonElement = document.querySelector(".close-button");
      buttonElement.onclick = function(){
          webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action: "closeIAB"}));
      };
      setTimeout(function(){
        let getDContainerClass = document.querySelector('.alert-container');
        getDContainerClass.classList.add('display');
      }, 500);

      setTimeout(function(){
        let getMessageClass = document.querySelectorAll('.message h5');
        for(var i=0; i < getMessageClass.length; i++){
          getMessageClass[i].classList.add('fade');
        }
      }, 1500);

      setTimeout(function(){
        buttonElement.classList.add('fade');
      }, 2000)
  `;
}
