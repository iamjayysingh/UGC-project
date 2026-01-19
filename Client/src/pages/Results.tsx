import {
  Loader2Icon,
  RefreshCwIcon,
  ImageIcon,
  VideoIcon,
  SparkleIcon,
} from "lucide-react";
import type { Project } from "../../types";

import { useEffect, useState } from "react";

import { dummyGenerations } from "../assets/assets";
import { Link } from "react-router-dom";
import { GhostButton, PrimaryButton } from "../components/Buttons";

const Results = () => {
  const [projects, setProjectsData] = useState<Project>({} as Project);

  const [loading, setLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  const fetchProjectData = async () => {
    setTimeout(() => {
      setProjectsData(dummyGenerations[0]);
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    fetchProjectData();
  }, []);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
  };

  return loading ? (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2Icon className="animate-spin text-indigo-500 size-9" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 mt-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-medium">
            Generation Result
          </h1>
          <Link
            to="/generate"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            <p className="max-sm:hidden">New Generation </p>
          </Link>
        </header>

        {/* {grid layout} */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* {main result display} */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel inline-block p-2 rounded-2xl">
              <div
                className={`${projects?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"} `}
              >
                {projects?.generatedVideo ? (
                  <video
                    src={projects.generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={projects.generatedImage}
                    alt="Generated result"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>
          {/* sidebar actions */}
          <div className="space-y-6">
            {/* download buttons */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Actions</h3>
              <div className="flex flex-col gap-3">
                <a href={projects.generatedImage} download>
                  <GhostButton
                    disabled={!projects.generatedImage}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="size-4.5" />
                    Download Image
                  </GhostButton>
                </a>
                <a href={projects.generatedVideo} download>
                  <GhostButton
                    disabled={!projects.generatedVideo}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <VideoIcon className="size-4.5" />
                    Download Video
                  </GhostButton>
                </a>
              </div>
            </div>

            {/* generate video button */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <VideoIcon className="size-24" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Magic</h3>
              <p className="text-gray-400 text-sm mb-6">
                Turn this static image into a dynamic video for social media
              </p>
              {!projects.generatedVideo ? (
                <PrimaryButton
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>Generating Video...</>
                  ) : (
                    <>
                      <SparkleIcon className="size-4" />
                      Generated Video
                    </>
                  )}
                </PrimaryButton>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-gray-400 text-center text-sm font-medium">
                  Video Generated Successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Results;
