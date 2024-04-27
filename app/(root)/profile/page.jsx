"use client";
import Loader from "@components/Loader";
import { PersonOutline } from "@mui/icons-material";
import { useSession } from "next-auth/react";
import { CldUploadButton } from "next-cloudinary";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Profile = () => {
  // useSession its take time to load so we need to use loading or useEffect
  //   and add reset to form state
  const { data: session } = useSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (user) {
      reset({
        // bellow we but the same name in register in the input and here give it the value
        username: user?.username,
        profileImage: user?.profileImage,
      });
    }
    setLoading(false);
    // [user] to wait it until exec then imp the code above
  }, [user]);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { error },
  } = useForm();

  const uploadPhoto = (result) => {
    // set value by use form state and put the url of image uploaded to can watch it bellow
    setValue("profileImage", result?.info?.secure_url);
  };

  const updateUser = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user._id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      setLoading(false);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };
  return loading ? (
    <Loader />
  ) : (
    <div className="profile-page">
      <h1 className="text-heading3-bold">Edit Your Profile</h1>
      <form className="edit-profile" onSubmit={handleSubmit(updateUser)}>
        <div className="input">
          <input
            {...register("username", {
              required: "Username is required",
              validate: (value) => {
                if (value.length < 3) {
                  return "Username must be at least 3 characters";
                }
              },
            })}
            type="text"
            placeholder="Username"
            className="input-field"
          />
          <PersonOutline sx={{ color: "#737373" }} />
        </div>
        {error?.username && (
          <p className="text-red-500">{error.username.message}</p>
        )}
        <div className="flex items-center justify-between">
          {/* watch("prfoileImage") to ensure when upload image to change it  */}
          <img
            src={
              watch("profileImage") ||
              user?.profileImage ||
              "/assets/person.jpg"
            }
            alt="profile"
            className="w-40 h-40 rounded-full"
          />
          <CldUploadButton
            options={{ maxFiles: 1 }}
            onUpload={uploadPhoto}
            uploadPreset="u1lqgbbg"
          >
            <p className="text-body-bold">Upload new photo</p>
          </CldUploadButton>
        </div>
        <button className="btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Profile;
