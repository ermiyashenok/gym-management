git init
git config user.email "bot@gymflow.local"
git config user.name "GymFlow Bot"

$files = git ls-files --others --exclude-standard
$fileArray = $files -split "`n" | Where-Object { $_.Trim() -ne "" }

# Total commits we want is 20
$targetCommits = 20
$commitCount = 1

for ($i = 0; $i -lt $targetCommits - 1; $i++) {
    if ($i -lt $fileArray.Length) {
        $file = $fileArray[$i].Trim()
        git add $file
        git commit -m "Add $file"
        $commitCount++
    }
}

if ($commitCount -le $targetCommits) {
    git add .
    git commit -m "Initial commit with remaining files"
}
