import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 md:px-6">
      <Card className="w-full max-w-[90%] md:max-w-md mx-auto">
        <CardContent className="pt-4 md:pt-6 pb-6 md:pb-8">
          <div className="flex flex-col sm:flex-row mb-3 md:mb-4 gap-2 sm:gap-3 md:gap-4 items-center sm:items-start text-center sm:text-left">
            <AlertCircle className="h-10 w-10 md:h-8 md:w-8 text-red-500 shrink-0" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600 text-center sm:text-left">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}