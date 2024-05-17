"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const Contacts = () => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const currentUser = session?.user || JSON.parse(localStorage.getItem("user"));

  const getContacts = async () => {
    try {
      const response = await fetch(
        search !== "" ? `/api/users/searchContact/${search}` : "/api/users"
      );
      const data = await response.json();
      setContacts(data.filter((contact) => contact._id !== currentUser._id));
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (currentUser) {
      getContacts();
    }
  }, [currentUser, search]);
  //   when ever one of each one in [] change the useEffect will work

  /* Select Contact */
  const [selectedContacts, setSelectedContacts] = useState([]);
  const isGroup = selectedContacts.length > 1;

  const handleSelect = (contact) => {
    if (selectedContacts.includes(contact)) {
      // if the contact was selected and we send it againg that mean we need to remove it using filter
      setSelectedContacts((prevSelectedContacts) =>
        prevSelectedContacts.filter((item) => item !== contact)
      );
    } else {
      // if contact we send was not selected to push it
      setSelectedContacts((prevSelectedContacts) => [
        ...prevSelectedContacts,
        contact,
      ]);
    }
  };

  /* ADD GROUP CHAT NAME*/
  const [name, setName] = useState("");
  const router = useRouter();

  /* CREATE CHAT */

  const createChat = async () => {
    const response = await fetch("/api/chats", {
      method: "POST",
      body: JSON.stringify({
        currentUserId: currentUser._id,
        members: selectedContacts.map((contact) => contact._id),
        isGroup,
        name,
      }),
    });
    const chat = await response.json();
    if (response.ok) {
      router.push(`/chats/${chat._id}`);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="create-chat-container">
      <input
        type="text"
        placeholder="Search Contacts..."
        className="input-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="contact-bar">
        <div className="contact-list">
          <p className="text-body-bold">Select or Deselect</p>
          {contacts.map((user, index) => (
            <div
              key={index}
              className="contact"
              onClick={() => handleSelect(user)}
            >
              {selectedContacts.find((item) => item === user) ? (
                <CheckCircle sx={{ color: "red" }} />
              ) : (
                <RadioButtonUnchecked />
              )}
              <img
                src={user.profileImage || "/assets/person.jpg"}
                alt="profile"
                className="profilePhoto"
              />
              <p className="text-base-bold">{user.username}</p>
            </div>
          ))}
        </div>
        <div className="create-chat">
          {isGroup && (
            // when greate then one this will appear that mean this is group
            <>
              <div className="flex flex-col gap-3">
                <p className="text-body-bold"> Group Chat Name</p>
                <input
                  type="text"
                  placeholder="Enter group chat name..."
                  className="input-group-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-body-bold">Members</p>
                <div className="flex flex-wrap gap-3">
                  {selectedContacts.map((contact, index) => (
                    <p className="selected-contact" key={index}>
                      {contact.username}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
          <button className="btn" onClick={createChat}>
            {" "}
            FIND OR START A NEW CHAT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
