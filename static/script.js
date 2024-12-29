document.addEventListener("DOMContentLoaded", () => {
    const categorySelect = document.getElementById("category-select");
    const fetchButton = document.getElementById("fetch-button");
    const wallpaperContainer = document.getElementById("wallpaper-container");

    fetchButton.addEventListener("click", () => {
        const selectedCategory = categorySelect.value;

        // Show loading spinner
        wallpaperContainer.innerHTML = "<div class='spinner'>Loading...</div>";

        // Fetch wallpapers from your server
        fetch("/fetch-wallpapers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category: selectedCategory }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);  // Debugging
            wallpaperContainer.innerHTML = ""; // Clear previous content

            if (data.wallpapers.length === 0) {
                wallpaperContainer.innerHTML = "<p>No wallpapers found for this category.</p>";
                return;
            }

            // Process each wallpaper
            data.wallpapers.forEach(wallpaper => {
                const img = document.createElement("img");

                // Fetch thumbnail URL using the proxy server
                const filename = wallpaper.split("/").pop().replace("File:", ""); // Remove "File:" prefix
                console.log("Filename:", filename); // Debugging
                const proxyUrl = `http://localhost:5001/proxy?action=query&titles=File:${filename}&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json`;
                console.log("Proxy URL:", proxyUrl); // Debugging

                fetch(proxyUrl)
                    .then(response => response.json())
                    .then(apiData => {
                        console.log("API Data:", apiData); // Debugging
                        const pages = apiData.query.pages;
                        const imageInfo = Object.values(pages)[0].imageinfo[0];
                        img.src = imageInfo.thumburl; // Use the thumbnail URL
                    })
                    .catch(error => {
                        console.error("Error fetching thumbnail:", error);
                        img.src = "/static/images/sunset2.png"; // Fallback image
                    });

                img.alt = "Wallpaper";
                img.classList.add("wallpaper-image");
                img.loading = "lazy"; // Lazy loading
                img.crossOrigin = "anonymous"; // Enable CORS

                // "Set as Wallpaper" button
                const setWallpaperButton = document.createElement("button");
                setWallpaperButton.textContent = "Set as Wallpaper";
                setWallpaperButton.classList.add("set-wallpaper-button");
                setWallpaperButton.addEventListener("click", () => {
                    // Open the full-size image in a new tab
                    window.open(wallpaper, "_blank");
                });

                // Create a container for each wallpaper
                const wallpaperItem = document.createElement("div");
                wallpaperItem.classList.add("wallpaper-item");
                wallpaperItem.appendChild(img);
                wallpaperItem.appendChild(setWallpaperButton);

                // Add the wallpaper to the container
                wallpaperContainer.appendChild(wallpaperItem);
            });
        })
        .catch(error => {
            console.error("Error fetching wallpapers:", error);
            wallpaperContainer.innerHTML = "<p>Failed to fetch wallpapers. Please try again later.</p>";
        });
    });
});