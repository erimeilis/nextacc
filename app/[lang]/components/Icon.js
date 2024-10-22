import React from "react";
import * as Icons from "react-icons/fa";

export default function Icon({
                                 name
                             }) {
    const IconComponent = Icons[name];

    if (!IconComponent) { // Return a default one
        return <Icons.FaCat/>;
    }

    return <IconComponent/>;
};