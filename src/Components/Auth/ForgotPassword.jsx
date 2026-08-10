import {useState} from "react";
import { getAuthInstance } from "../../Firebase/firebase";


const ForgotPassword = ({goToLogin})=>{


const [email,setEmail]=useState("");



const resetPassword = async()=>{


try{

const auth = await getAuthInstance();
const { sendPasswordResetEmail } = await import("firebase/auth");

await sendPasswordResetEmail(
auth,
email
);


alert("Reset email sent");


}catch(error){

alert(error.message);

}


};



return(

<div>


<h2 className="text-3xl font-bold">
Reset Password
</h2>


<input

type="email"

placeholder="Enter email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

className="w-full border rounded-xl px-4 py-3 mt-5"

/>


<button

onClick={resetPassword}

className="w-full bg-yellow-500 text-white py-3 rounded-xl mt-4"

>
Send Reset Link
</button>


<button

onClick={goToLogin}

className="mt-5 text-yellow-600"

>
Back to Login
</button>


</div>

);


};


export default ForgotPassword;