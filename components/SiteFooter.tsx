const usefulLinks = [
  { label: "প্রাথমিক শিক্ষা অধিদপ্তর", href: "https://www.dpe.gov.bd/" },
  {
    label: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (এনসিটিবি)",
    href: "https://nctb.portal.gov.bd/site/page/52ce556f-6fbe-429a-8211-2704050f115e",
  },
  { label: "শিক্ষা মন্ত্রণালয়", href: "https://shed.gov.bd/" },
  {
    label: "প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়",
    href: "https://mopme.gov.bd/site/view/notification_circular",
  },
  { label: "মুক্তপাঠ", href: "https://muktopaath.gov.bd/" },
  {
    label: "Education Board Result",
    href: "http://www.educationboardresults.gov.bd/",
  },
  {
    label: "School facebook Page",
    href: "https://www.facebook.com/profile.php?id=100054300799264",
  },
  { label: "Educational Page", href: "https://www.facebook.com/SWAK247" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-left">
          <img
            className="footer-logo"
            src="/assets/school.jpg"
            alt="Eden International School logo"
          />
          <p>
            <i className="fas fa-map-marker-alt" aria-hidden="true" /> Khilgaon,
            Dhaka-1219
          </p>
          <p>
            <i className="fas fa-phone-alt" aria-hidden="true" /> 01868612880
          </p>
          <p>
            <i className="fas fa-envelope" aria-hidden="true" />{" "}
            eden.school@gmail.com
          </p>
        </div>

        <div className="footer-right">
          <h3>গুরুত্বপূর্ণ লিংক</h3>
          <ul>
            {usefulLinks.map(({ label, href }) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-left">
          <p>
            Copyright © 2025 <strong>EISC</strong>. All Rights Reserved
          </p>
        </div>
        <div className="footer-right">
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
