"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/useAuth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { isAuthenticated, roles } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const hasAccess =
      isAuthenticated &&
      Array.isArray(roles) &&
      roles.some((role) => allowedRoles.includes(role));

    if (!hasAccess) {
      router.push("/unauthorized"); // redirige si no tiene acceso
    } else {
      setChecking(false); // acceso confirmado
    }
  }, [isAuthenticated, roles, allowedRoles, router]);

  if (checking) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border text-primary" role="status" />
        <p className="mt-3">Verificando permisos...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
