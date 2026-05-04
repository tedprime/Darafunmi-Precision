import React from "react";
import { Lock, ArrowRight } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="bg-blue-600 text-white p-3 rounded-md inline-block font-bold text-xl mb-4">
          DPT
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-6">DPT Admin Panel</p>

        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <div className="flex items-center justify-center mb-2">
            <Lock size={20} className="text-blue-600 mr-2" />
            <span className="font-medium text-gray-800">Secure Access</span>
          </div>
          <p className="text-sm text-gray-600">
            Sign in with your Manus account to access the admin panel.
          </p>
        </div>

        <Button className="w-full flex items-center justify-center">
          Sign In with Manus <ArrowRight size={18} className="ml-2" />
        </Button>

        <p className="text-xs text-gray-500 mt-8">
          Darafunmi Precision Technologies Ltd.
          <br />
          &copy; 2025 All rights reserved
        </p>
      </Card>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center text-white text-sm">
        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
        Secure Connection
      </div>
    </div>
  );
};

export default LoginPage;
