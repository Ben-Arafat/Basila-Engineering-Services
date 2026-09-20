import { getAuthInstance, getGoogleProvider } from "../../Firebase/firebase";


const GoogleButton = ()=>{


const googleLogin = async()=>{


try{

const auth = await getAuthInstance();
const provider = await getGoogleProvider();
const {
	signInWithPopup,
	signInWithRedirect,
} = await import("firebase/auth");

const isMobile = window.matchMedia(
	"(max-width: 767px)"
).matches;

if (isMobile) {
	await signInWithRedirect(auth, provider);
	return;
}

await signInWithPopup(auth, provider);


alert("Google login successful");


}catch(error){

if (error.code === "auth/unauthorized-domain") {
	console.error(
		`Authorize ${window.location.hostname} in Firebase Console > Authentication > Settings > Authorized domains.`
	);
} else {
	console.error(error.message);
}

}


};



return(

<button

onClick={googleLogin}

className="w-full border py-3 rounded-xl mt-5"

>

Continue with Google

</button>


);


};


export default GoogleButton;