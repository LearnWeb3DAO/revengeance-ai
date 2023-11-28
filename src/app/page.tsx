"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [storyStart, setStoryStart] = useState("");
  const [arrayOfText, setArrayOfText] = useState<string[]>([]);
  const [creativitySlider, setCreativitySlider] = useState<string>("40");
  const [isLoading, setIsLoading] = useState(false)
  const [unhingedMode, setUnhingedMode] = useState(false);
  const [genre, setGenre] = useState("Horror");
  const [numEnteredWords, setNumEnteredWords] = useState(0)
  const scrollToRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    console.log(creativitySlider);
  }, [creativitySlider]);

  useEffect(() => {
    console.log("unhinged mode is ", unhingedMode ? "on" : "off");
  }, [unhingedMode]);

  const completeStory = async () => {
    setArrayOfText([])
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        body: JSON.stringify({
          model: "mistral",
          prompt: `write a ${genre} story that starts with these words: ${storyStart}. Your response should start from these words too`,
          options: {
            temperature: unhingedMode ? 500 : parseInt(creativitySlider) / 100,
          },
        }),
      });

      if (response.body) {
        const reader = response.body!.getReader();
        scrollToRef.current?.scrollIntoView()
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          // convert the chunk of data to text and parse JSON)
          const text = new TextDecoder().decode(value);
          const responseObject = JSON.parse(text);

          if (responseObject.done === false) {
            if (arrayOfText) {
              console.log("this ran");
              setArrayOfText((prev) => [...prev!, responseObject.response]);
            } else {
              setArrayOfText([responseObject.response]);
            }
            

          }
          console.log(responseObject);
          if(responseObject.error){
            window.alert(responseObject.error)
          }
        }

        // Close the reader when done
        reader.releaseLock();
        setIsLoading(false)
      } else {
        throw Error;
      }
      // console.log(await response.json());
    } catch (error) {
      console.error("Error occurred during API call:", error);
      window.alert("Please make sure you've started ollama")
      setIsLoading(false)
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-32 py-12 bg-gray-900">
      <div className="text-3xl mb-12">Revengeance AI</div>


      <div className="flex  flex-col  px-32 py-4 gap-10 w-full justify-center">
        <div className=" bg-slate-800 rounded-md p-4 pb-6 flex flex-col gap-2 border-red-500 storystarter">
          <label
            htmlFor="startingLine"
            className=" flex flex-col  justify-center"
          >
            Start your story:
          </label>
          <div className="flex">
            <input
              name="startingLine"
              value={storyStart}
              onChange={(event) => {

                if (event.target.value.split(" ").length < 16) {
                  setStoryStart(event.target.value);
                  if (event.target.value===""){
                    setNumEnteredWords(0)
                  }
                  else{
                  setNumEnteredWords(event.target.value.split(" ").length);
                  }
                }
              }}
              className="text-black h-8 px-1 w-full rounded-l-md select-none outline-none disabled:bg-white "
            />
            <div className="flex bg-white rounded-r-md">
              <span className="h-min px-1 self-end rounded-r-md text-gray-700 text-sm align-baseline">
                {numEnteredWords}/15
              </span>
            </div>
          </div>
        </div>

        <div className=" flex  justify-evenly gap-2">

          <div className="  flex p-3 bg-slate-800 gap-4 rounded-md  justify-center">
            <span className="w-max flex self-center px-2 py-1  ">
              Select a genre:{" "}
            </span>
            <select
              value={genre}
              className=" outline-none h-min self-center  hover:cursor-pointer border text-md rounded-lg  block p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500"
              onChange={(event) => {
                setGenre(event.target.value);
              }}
            >
              <option>Horror</option>
              <option>Sci-Fi</option>
              <option>Drama</option>
              <option>Thriller</option>
              <option>Comedy</option>
              <option>Romance</option>
            </select>
          </div>

          <div className=" flex flex-col gap-2  bg-slate-800 p-4 rounded-md  justify-center">
            <div className="flex gap-4     justify-center">
              <span>How creative?</span>
              <input
                className={" accent-blue-500 select-none w-min self-center"}
                disabled={unhingedMode}
                type="range"
                min="0"
                max="200"
                value={creativitySlider}
                onChange={(event) => setCreativitySlider(event.target.value)}
              />
            </div>
            {creativitySlider === "200" ? (
              <div
                className={` flex justify-center self-center gap-1`}
              >
                <input
                  type="checkbox"
                  className=" accent-red-400 "
                  checked={unhingedMode}
                  onChange={() => setUnhingedMode(!unhingedMode)}
                />
                <span className="text-red-400">Unhinged mode</span>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="self-center">
        <button className="bg-blue-600  w-min px-8 py-2 rounded-md disabled:cursor-not-allowed disabled:bg-blue-400" onClick={completeStory} disabled={isLoading}>
          {isLoading?<span className="flex rounded-full self-center border-t-white border-2  box-border animate-spin h-6 w-6"></span>:unhingedMode?"Unleash!":"Go!"}        </button>
        </div>
      </div>

      <div className="px-32 mt-8 py-4 gap-10 w-full" ref={scrollToRef}>
        <div className={`rounded-xl  text-lg p-8 text-center  w-full text-slate-300 ${arrayOfText.length>0?"border-2 border-slate-700 bg-slate-950 ":""}`}>
        

        {arrayOfText != undefined
          ? arrayOfText.map((response, index) => (
              <span key={index}>{response}</span>
            ))
          : ""}
          </div>
      </div>
    </main>
  );
}
