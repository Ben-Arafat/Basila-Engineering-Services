import { getAuthInstance, getGoogleProvider } from "../../Firebase/firebase";


const GoogleButton = ()=>{


const googleLogin = async()=>{


try{

const auth = await getAuthInstance();
const provider = await getGoogleProvider();
const { signInWithPopup } = await import("firebase/auth");

await signInWithPopup(
auth,
provider
);


alert("Google login successful");


}catch(error){

console.log(error.message);

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