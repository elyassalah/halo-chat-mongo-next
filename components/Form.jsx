"use client";
import {
  EmailOutlined,
  LockOutlined,
  PersonOutline,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
// bellow hook keep watch the change of input and show error, nice
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Form = ({ type }) => {

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const router = useRouter();

  const onSubmit = async (data) => {
    if (type === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // console.log(res);
        router.push("/");
      }
      if (res.error) {
        // to use toast should make toaster context in componenet and add it to the layout
        toast.error("Something went wrong");
      }
    }
    if (type === "login") {
      // signIn this will call the provider in nextauth that have this name
      // and Imp the authorize func iside it
      const res = await signIn("credentials", {
        // we use spread operator in data cause the credentials and data have the same param
        // we wanna pass and email so it will take them
        ...data,
        redirect: false,
      });
      if (res.ok) {
        // console.log(res);

        router.push("/chats");
      }
      if (res.error) {
        // to use toast should make toaster context in componenet and add it to the layout
        toast.error("Invalid email or password");
      }
    }
  };
  return (
    <div className="auth">
      <div className="content">
        <img src="/assets/logo.png" alt="logo" className="logo" />
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {type === "register" && (
            <div>
              <div className="input">
                <input
                  defaultValue=""
                  {...register("username", {
                    required: "Username is required",
                    validate: (value) => {
                      if (value.length < 3) {
                        return "Username must be at least 3 chars";
                      }
                    },
                  })}
                  type="text"
                  placeholder="Username"
                  className="input-field"
                />
                <PersonOutline sx={{ color: "#737373" }} />
              </div>
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
              )}
            </div>
          )}
          <div>
            <div className="input">
              <input
                defaultValue=""
                // inside register first param is the key of this item that save it in the form state use register function
                {...register("email", {
                  required: "Email is required",
                })}
                type="email"
                placeholder="Email"
                className="input-field"
              />
              <EmailOutlined sx={{ color: "#737373" }} />
            </div>
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <div className="input">
              <input
                defaultValue=""
                {...register("password", {
                  required: "Password is required",
                  validate: (value) => {
                    if (
                      value.length < 5 ||
                      !value.match(/[!@#$%^&*()_+\[\]:;<>,.?~\\/-]/)
                    ) {
                      return "Password must be at least 5 chars and contain at least one special char";
                    }
                  },
                })}
                type="password"
                placeholder="Password"
                className="input-field"
              />
              <LockOutlined sx={{ color: "#737373" }} />
            </div>
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>
          <button className="button" type="submit">
            {type === "register" ? "Join Free" : "let's Chat"}
          </button>
        </form>
        {type === "register" ? (
          <Link href="/" className="link">
            <p className="text-center">Already have an account? Sign In Here</p>
          </Link>
        ) : (
          <Link href="/register" className="link">
            <p className="text-center">Don't have an account? Register Here</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Form;
