
import React from "react";
import { ArrowLeft, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface SettingsHeaderProps {
  title?: string;
  description?: string;
}

const SettingsHeader: React.FC<SettingsHeaderProps> = ({ 
  title = "General Settings",
  description = "Configure system preferences and appearance"
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="dark:border-gray-700 dark:hover:bg-gray-800 border-border">
          <Link to="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Sliders className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
