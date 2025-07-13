import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <div className="footer">
      <p>&copy; 2024 Edvance. All Rights Reserved.</p>
      <div className="footer__links">
        {["About", "Contact", "Privacy Policy", "Terms of Service"].map(
          (item) => (
            <Link
              href={`/${item.toLowerCase().replace(" ", "-")}`}
              key={item}
              className="footer__link"
            >
              {item}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

export default Footer;
