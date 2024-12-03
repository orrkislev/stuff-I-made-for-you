//:HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">1. Drawing a Simple Ellipse</h2>
<p class="mb-4">Let's start with the basics: drawing an ellipse. We're creating an oval shape that's tilted at a 30-degree angle. This is your first step into the world of dynamic shapes!</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">rotate(30)</code>: This tilts our ellipse.</li>
        <li><code class="bg-gray-200 px-1 rounded">ellipse(0, 0, 50, 100)</code>: Creates an ellipse at the center (0,0) with width 50 and height 100.</li>
    </ul>
</div>
//:JS
rotate(30)
ellipse(0, 0, 50, 100)