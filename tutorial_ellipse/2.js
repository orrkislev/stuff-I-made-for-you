//: HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">2. Rotating the Ellipse</h2>
<p class="mb-4">Now we're making things interactive! The ellipse will now rotate to follow your mouse. It's like the ellipse is curiously watching your cursor move around the canvas.</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">V(mouseX - width / 2, mouseY - height / 2)</code>: Creates a vector pointing to the mouse.</li>
        <li><code class="bg-gray-200 px-1 rounded">dirVector.heading()</code>: Calculates the angle of this vector.</li>
        <li><code class="bg-gray-200 px-1 rounded">rotate(ang)</code>: Rotates the canvas based on the mouse position.</li>
    </ul>
</div>

//: JS
const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)

ellipse(0, 0, 50, 100)