import { useState } from "react";
import { getAuthInstance } from "../../firebase/firebase";
import GoogleButton from "./GoogleButton";


const Login = ({goToSignup, goToForgot}) => {


const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [error,setError] = useState("");
const [loading,setLoading] = useState(false);



const handleLogin = async(e)=>{

e.preventDefault();

try{

setLoading(true);
setError("");

const auth = await getAuthInstance();
const { signInWithEmailAndPassword } = await import("firebase/auth");

await signInWithEmailAndPassword(
auth,
email,
password
);


alert("Login successful 🎉");


}catch(error){

setError(error.message);


}finally{

setLoading(false);

}

};



return (

<div>

<h2 className="text-3xl font-bold text-center">
Welcome Back 👋
</h2>


<p className="text-center text-gray-500 mt-2">
Login to your account
</p>



<form 
onSubmit={handleLogin}
className="mt-6 space-y-4"
>


<input

type="email"

placeholder="Email"

autoComplete="email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

className="w-full border rounded-xl px-4 py-3"

/>



<input

type="password"

placeholder="Password"

autoComplete="current-password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

className="w-full border rounded-xl px-4 py-3"

/>


{
error && 
<p className="text-red-500 text-sm">
{error}
</p>
}



<button

disabled={loading}

className="w-full bg-yellow-500 text-white py-3 rounded-xl"

>

{
loading ? "Logging in..." : "Login"
}

</button>


</form>



<GoogleButton />



<button
onClick={goToForgot}
className="mt-4 text-yellow-600"
>
Forgot Password?
</button>



<p className="mt-5 text-center">

Don't have an account?

<button

onClick={goToSignup}

className="ml-2 text-yellow-600 font-bold"

>
Sign Up
</button>


</p>


</div>

);

};


export default Login;