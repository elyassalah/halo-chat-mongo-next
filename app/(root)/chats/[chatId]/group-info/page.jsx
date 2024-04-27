"use client";
import Loader from "@components/Loader";
import { GroupOutlined, PersonOutline } from "@mui/icons-material";
import { CldUploadButton } from "next-cloudinary";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const GroupInfo = () => {
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState({});
  // we do not take this params in the top inside () cause it not coming
  // from this route its come from prev route [chatId]
  const { chatId } = useParams();

  const getChatDetails = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      const data = await response.json();
      setChat(data);
      setLoading(false);
      reset({
        name: data?.name,
        groupPhoto: data?.groupPhoto,
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (chatId) {
      getChatDetails();
    }
  }, [chatId]);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { error },
  } = useForm();

  const uploadPhoto = (result) => {
    console.log(result);
    setValue("groupPhoto", result?.info?.secure_url);
  };

  const router = useRouter();

  const updateGroupChat = async (data) => {
    setLoading(true);
    try {
      console.log(data);
      const response = await fetch(`/api/chats/${chatId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      setLoading(false);
      if (response.ok) {
        console.log("done =================================");
        router.push(`/chats/${chatId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return loading ? (
    <Loader />
  ) : (
    <div className="profile-page">
      <h1 className="text-heading3-bold">Edit Group Info</h1>
      <form className="edit-profile" onSubmit={handleSubmit(updateGroupChat)}>
        <div className="input">
          <input
            {...register("name", {
              required: "Group chat name is required",
              validate: (value) => {
                if (value.length < 3) {
                  return "Group chat name must be at least 3 characters";
                }
              },
            })}
            type="text"
            placeholder="Group chat name"
            className="input-field"
          />
          <GroupOutlined sx={{ color: "#737373" }} />
        </div>
        {error?.name && <p className="text-red-500">{error.name.message}</p>}
        <div className="flex items-center justify-between">
          <img
            src={watch("groupPhoto") || "/assets/group.png"}
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
        <div className="flex flex-wrap gap-3">
          {chat?.members?.map((member, index) => (
            <p className="selected-contact" key={index}>
              {member.username}
            </p>
          ))}
        </div>
        <button className="btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default GroupInfo;
