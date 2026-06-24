const fs = require('fs');
const files = [
  'src/store/useStore.js',
  'src/pages/PaymentsPage.jsx',
  'src/pages/LandingPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/data/mockData.js',
  'src/components/modals/ReceiptModal.jsx',
  'src/components/modals/RecordPaymentModal.jsx',
  'src/components/modals/MemberDetailsDrawer.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\$\$\{/g, 'Birr ${');
    content = content.replace(/\$(\d+)/g, 'Birr $1');
    content = content.replace(/'USD'/g, "'Birr'");
    content = content.replace(/>USD</g, ">Birr<");
    content = content.replace(/Total: \$/g, 'Total: Birr ');
    content = content.replace(/>\$/g, '>Birr ');
    content = content.replace(/ \$([^\s{])/g, ' Birr $1');
    fs.writeFileSync(f, content);
  }
});
